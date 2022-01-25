import { useEffect, useState } from 'react';
import { network } from 'config';
import * as React from 'react';

import {
  ContractFunction,
  Address,
  AddressValue,
  decodeBigNumber,
  decodeString,
  decodeUnsignedNumber,
  ProxyProvider,
  Query
} from '@elrondnetwork/erdjs';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core';

import Withdrawal from './components/Withdrawal';

import { useDashboard } from '../provider';

interface WithdrawalsType {
  value: string;
  timeLeft: number;
}

const Withdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Array<WithdrawalsType>>([]);

  const { denominated } = useDashboard();
  const { account } = useGetAccountInfo();

  const getWithdrawals = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const provider = new ProxyProvider(network.gatewayAddress);
        const query = new Query({
          address: new Address(network.delegationContract),
          func: new ContractFunction('getUserUnDelegatedList'),
          args: [new AddressValue(new Address(account.address))]
        });

        const [data, config, status] = await Promise.all([
          provider.queryContract(query),
          provider.getNetworkConfig(),
          provider.getNetworkStatus()
        ]);

        const payload = data
          .outputUntyped()
          .reduce((total: any, item, index, array) => {
            if (index % 2 !== 0) {
              return total;
            } else {
              const next = array[index + 1];
              const getTime = (): number => {
                const epochsChangesRemaining = decodeUnsignedNumber(next);
                const roundsRemainingInEpoch =
                  config.RoundsPerEpoch - status.RoundsPassedInCurrentEpoch;
                const roundEpochComplete =
                  epochsChangesRemaining > 1
                    ? (epochsChangesRemaining - 1) * config.RoundsPerEpoch
                    : 0;

                return (
                  ((roundsRemainingInEpoch + roundEpochComplete) *
                    config.RoundDuration) /
                  1000
                );
              };

              const current = {
                timeLeft: decodeString(next) === '' ? 0 : getTime(),
                value: denominated(decodeBigNumber(item).toFixed())
              };

              const exists = total.find(
                (item: WithdrawalsType) => item.timeLeft === current.timeLeft
              );

              const value = exists
                ? (parseInt(exists.value) + parseInt(current.value)).toFixed()
                : 0;

              if (exists) {
                return [
                  ...(total.length > 1 ? total : []),
                  {
                    ...exists,
                    value
                  }
                ];
              } else {
                return [...total, current];
              }
            }
          }, []);

        setWithdrawals(
          payload.sort(
            (alpha: WithdrawalsType, beta: WithdrawalsType) =>
              alpha.timeLeft - beta.timeLeft
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

    if (account.address !== '...') {
      fetchData();
    }

    return () => setWithdrawals([]);
  };

  useEffect(getWithdrawals, [account.address, denominated]);

  if (withdrawals.length === 0) {
    return null;
  }

  return (
    <div className='card mt-spacer'>
      <div className='card-body p-spacer'>
        <div className='d-flex flex-wrap align-items-center justify-content-between mb-spacer'>
          <p className='h6 mb-0'>Pending Withdrawals</p>
        </div>
        <div className='table-responsive'>
          <table className='table table-borderless mb-0'>
            <thead className='text-uppercase font-weight-normal'>
              <tr>
                <th>Undelegated Amount</th>
                <th>Wait Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal: WithdrawalsType) => (
                <Withdrawal key={withdrawal.timeLeft} {...withdrawal} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
