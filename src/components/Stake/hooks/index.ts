import { useEffect } from 'react';

import {
  useGetAccountInfo,
  transactionServices
} from '@elrondnetwork/dapp-core';
import {
  ProxyProvider,
  Address,
  AddressValue,
  Query,
  ContractFunction,
  decodeBigNumber
} from '@elrondnetwork/erdjs';
import BigNumber from 'bignumber.js';

import { network } from 'config';
import { useDispatch, useGlobalContext } from 'context';
import { denominated } from 'helpers/denominate';
import { nominateValToHex } from 'helpers/nominate';
import useTransaction from 'helpers/useTransaction';

interface DelegationPayloadType {
  amount: string;
}

const useStakeData = () => {
  const dispatch = useDispatch();

  const { account, address } = useGetAccountInfo();
  const { sendTransaction } = useTransaction();
  const { contractDetails, userClaimableRewards, totalActiveStake } =
    useGlobalContext();
  const { successful, hasActiveTransactions } =
    transactionServices.useGetActiveTransactionsStatus();

  const onDelegate = async (data: DelegationPayloadType): Promise<void> => {
    try {
      await sendTransaction({
        value: data.amount,
        type: 'delegate',
        args: ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onUndelegate = async (data: DelegationPayloadType): Promise<void> => {
    try {
      await sendTransaction({
        value: '0',
        type: 'unDelegate',
        args: nominateValToHex(data.amount.toString())
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onRedelegate = async (): Promise<void> => {
    try {
      await sendTransaction({
        value: '0',
        type: 'reDelegateRewards',
        args: ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onClaimRewards = async (): Promise<void> => {
    try {
      await sendTransaction({
        value: '0',
        type: 'claimRewards',
        args: ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getStakingLimits = () => {
    if (contractDetails.data && totalActiveStake.data) {
      const automaticActivation = contractDetails.data.automaticActivation;
      const delegationCap = contractDetails.data.delegationCap;
      const balance = new BigNumber(
        denominated(account.balance, {
          showLastNonZeroDecimal: true,
          addCommas: false
        })
      );

      const formatted = {
        total: denominated(totalActiveStake.data.replace(/,/g, '')),
        cap: denominated(delegationCap.replace(/,/g, ''))
      };

      const available = new BigNumber(formatted.cap).minus(
        new BigNumber(formatted.total)
      );

      console.log(formatted);

      return {
        available: available.toFixed(),
        exceeds:
          balance.comparedTo(available) >= 0 && automaticActivation === 'ON'
      };
    }

    return {
      exceeds: false,
      available: ''
    };
  };

  const getUserClaimableRewards = async (): Promise<void> => {
    dispatch({
      type: 'getUserClaimableRewards',
      userClaimableRewards: {
        status: 'loading',
        data: null,
        error: null
      }
    });

    try {
      const provider = new ProxyProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getClaimableRewards'),
        args: [new AddressValue(new Address(address))]
      });

      const data = await provider.queryContract(query);
      const [claimableRewards] = data.outputUntyped();

      dispatch({
        type: 'getUserClaimableRewards',
        userClaimableRewards: {
          status: 'loaded',
          error: null,
          data: denominated(decodeBigNumber(claimableRewards).toFixed(), {
            decimals: 4
          })
        }
      });
    } catch (error) {
      dispatch({
        type: 'getUserClaimableRewards',
        userClaimableRewards: {
          status: 'error',
          data: null,
          error
        }
      });
    }
  };

  const fetchClaimableRewards = () => {
    if (!userClaimableRewards.data) {
      getUserClaimableRewards();
    }
  };

  const reFetchClaimableRewards = () => {
    if (successful && hasActiveTransactions && userClaimableRewards.data) {
      getUserClaimableRewards();
    }
  };

  useEffect(fetchClaimableRewards, [userClaimableRewards.data]);
  useEffect(reFetchClaimableRewards, [successful, hasActiveTransactions]);

  return {
    onDelegate,
    onUndelegate,
    onRedelegate,
    onClaimRewards,
    getStakingLimits
  };
};

export default useStakeData;
