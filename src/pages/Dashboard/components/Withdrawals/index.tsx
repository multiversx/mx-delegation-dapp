import * as React from 'react';
import { useEffect } from 'react';

import { useGetAccountInfo } from '@elrondnetwork/dapp-core';
import {
  decodeUnsignedNumber,
  ContractFunction,
  ProxyProvider,
  AddressValue,
  Address,
  Query,
  decodeString,
  decodeBigNumber
} from '@elrondnetwork/erdjs';
import { network, decimals, denomination } from 'config';
import { useGlobalContext, useDispatch } from 'context';
import { UndelegateStakeListType } from 'context/state';
import denominate from 'helpers/denominate';

import Withdrawal from './components/Withdrawal';

const Withdrawals: React.FC = () => {
  const dispatch = useDispatch();

  const { undelegatedStakeList } = useGlobalContext();
  const { account } = useGetAccountInfo();

  const getUndelegatedStakeList = async (): Promise<void> => {
    dispatch({
      type: 'getUndelegatedStakeList',
      undelegatedStakeList: {
        status: 'loading',
        data: null,
        error: null
      }
    });

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
              value: denominate({
                input: decodeBigNumber(item).toFixed(),
                decimals,
                denomination
              })
            };

            const exists = total.find(
              (withdrawal: UndelegateStakeListType) =>
                withdrawal.timeLeft === withdrawal.timeLeft
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

      dispatch({
        type: 'getUndelegatedStakeList',
        undelegatedStakeList: {
          status: 'loaded',
          error: null,
          data: payload.sort(
            (alpha: UndelegateStakeListType, beta: UndelegateStakeListType) =>
              alpha.timeLeft - beta.timeLeft
          )
        }
      });
    } catch (error) {
      dispatch({
        type: 'getUndelegatedStakeList',
        undelegatedStakeList: {
          status: 'error',
          data: null,
          error
        }
      });
    }
  };

  useEffect(() => {
    if (!undelegatedStakeList.data) {
      getUndelegatedStakeList();
    }
  }, [undelegatedStakeList.data]);

  if (!undelegatedStakeList.data || undelegatedStakeList.data.length === 0) {
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
              {undelegatedStakeList.data.map(
                (withdrawal: UndelegateStakeListType) => (
                  <Withdrawal key={withdrawal.timeLeft} {...withdrawal} />
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
