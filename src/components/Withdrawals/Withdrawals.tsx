import { useEffect } from 'react';
import {
  decodeUnsignedNumber,
  ContractFunction,
  AddressValue,
  Address,
  Query,
  decodeString,
  decodeBigNumber
} from '@multiversx/sdk-core';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account/useGetAccountInfo';
import { useGetSuccessfulTransactions } from '@multiversx/sdk-dapp/hooks/transactions/useGetSuccessfulTransactions';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import moment from 'moment';

import { network, decimals, denomination } from 'config';
import { useGlobalContext, useDispatch } from 'context';
import { UndelegateStakeListType } from 'context/state';
import denominate from 'helpers/denominate';

import { Withdrawal } from './components/Withdrawal';

import styles from './styles.module.scss';

export const Withdrawals = () => {
  const dispatch = useDispatch();

  const { account } = useGetAccountInfo();
  const { undelegatedStakeList } = useGlobalContext();
  const { hasSuccessfulTransactions, successfulTransactionsArray } =
    useGetSuccessfulTransactions();

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
      const provider = new ProxyNetworkProvider(network.gatewayAddress);
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
        .getReturnDataParts()
        .reduce((total: any, item, index, array) => {
          if (index % 2 !== 0) {
            return total;
          } else {
            const next: Buffer = array[index + 1];
            const getTime = (): number => {
              const epochsChangesRemaining = decodeUnsignedNumber(next);
              const roundsRemainingInEpoch =
                config.RoundsPerEpoch - status.RoundsPassedInCurrentEpoch;
              const roundEpochComplete =
                epochsChangesRemaining > 1
                  ? (epochsChangesRemaining - 1) * config.RoundsPerEpoch
                  : 0;

              return (
                moment().unix() +
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

            if (exists && current.timeLeft === exists.timeLeft) {
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

  const fetchUndelegatedStakeList = () => {
    if (!undelegatedStakeList.data) {
      getUndelegatedStakeList();
    }
  };

  const refetchUndelegatedStakeList = () => {
    if (
      hasSuccessfulTransactions &&
      undelegatedStakeList.data &&
      successfulTransactionsArray.length > 0
    ) {
      getUndelegatedStakeList();
    }
  };

  useEffect(fetchUndelegatedStakeList, [undelegatedStakeList.data]);
  useEffect(refetchUndelegatedStakeList, [
    hasSuccessfulTransactions,
    successfulTransactionsArray.length
  ]);

  if (!undelegatedStakeList.data || undelegatedStakeList.data.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.withdrawals} withdrawals`}>
      <div className={styles.heading}>
        <span className={styles.title}>Pending Withdrawals</span>
      </div>

      <div className={styles.body}>
        {undelegatedStakeList.data.map(
          (withdrawal: UndelegateStakeListType) => (
            <Withdrawal key={withdrawal.timeLeft} {...withdrawal} />
          )
        )}
      </div>
    </div>
  );
};
