import { useState, useEffect } from 'react';
import {
  Address,
  AddressValue,
  ContractFunction,
  ProxyProvider,
  Query,
  decodeString,
  decodeBigNumber
} from '@elrondnetwork/erdjs';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core';
import BigNumber from 'bignumber.js';

import { network } from 'config';
import { useDashboard } from 'pages/Dashboard/provider';

interface UnstakeableType {
  exceeds: boolean;
  active: boolean;
  available: string;
}

const useClient = () => {
  const { account, address } = useGetAccountInfo();
  const { denominated } = useDashboard();

  const [userStake, setUserStake] = useState<string>('0');
  const [rewards, setRewards] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(true);
  const [unstakeable, setUnstakeable] = useState<UnstakeableType>({
    active: false,
    exceeds: false,
    available: ''
  });

  const getClientData = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const provider = new ProxyProvider(network.gatewayAddress);
        const queryData = (contract: string, addressed?: boolean) =>
          new Query({
            address: new Address(network.delegationContract),
            func: new ContractFunction(contract),
            args: addressed ? [new AddressValue(new Address(address))] : []
          });

        const [claimable, stake, total, config] = await Promise.all([
          provider.queryContract(queryData('getClaimableRewards', true)),
          provider.queryContract(queryData('getUserActiveStake', true)),
          provider.queryContract(queryData('getTotalActiveStake')),
          provider.queryContract(queryData('getContractConfig'))
        ]);

        const balance = new BigNumber(
          denominated(account.balance, {
            showLastNonZeroDecimal: true,
            addCommas: false
          })
        );

        const [totalStake] = total.outputUntyped();
        const [userStake] = stake.outputUntyped();
        const [claimableRewards] = claimable.outputUntyped();

        const indexes = {
          contractCap: 2,
          contractCapAvailable: 4
        };

        const decoded = {
          total: decodeBigNumber(totalStake).toFixed(),
          cap: decodeBigNumber(
            config.outputUntyped()[indexes.contractCap]
          ).toFixed(),
          capable: decodeString(
            config.outputUntyped()[indexes.contractCapAvailable]
          )
        };

        const formatted = {
          total: denominated(decoded.total.replace(/,/g, '')),
          cap: denominated(decoded.cap.replace(/,/g, '')),
          stake: denominated(decodeBigNumber(userStake).toFixed()),
          claimable: denominated(decodeBigNumber(claimableRewards).toFixed(), {
            decimals: 4
          })
        };

        const available = new BigNumber(formatted.cap).minus(
          new BigNumber(formatted.total)
        );

        setRewards(formatted.claimable);
        setUserStake(formatted.stake);
        setUnstakeable({
          available: available.toFixed(),
          exceeds:
            balance.comparedTo(available) >= 0 && decoded.capable === 'true',
          active:
            new BigNumber(decoded.total).isGreaterThanOrEqualTo(
              new BigNumber(decoded.cap)
            ) && decoded.cap !== '0'
        });

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => {
      setLoading(true);
      setRewards('0');
      setUserStake('0');
      setUnstakeable({
        active: false,
        exceeds: false,
        available: ''
      });
    };
  };

  useEffect(getClientData, [denominated, address, account.balance]);

  return {
    loading,
    rewards,
    userStake,
    unstakeable
  };
};

export default useClient;
