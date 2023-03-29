import { useEffect, useState } from 'react';

import {
  Address,
  AddressValue,
  Query,
  ContractFunction,
  decodeBigNumber
} from '@multiversx/sdk-core';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account/useGetAccountInfo';
import { useGetActiveTransactionsStatus } from '@multiversx/sdk-dapp/hooks/transactions/useGetActiveTransactionsStatus';
import { useGetSuccessfulTransactions } from '@multiversx/sdk-dapp/hooks/transactions/useGetSuccessfulTransactions';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import BigNumber from 'bignumber.js';

import { network, minDust } from 'config';
import { useDispatch, useGlobalContext } from 'context';
import { denominated } from 'helpers/denominate';
import getPercentage from 'helpers/getPercentage';
import { nominateValToHex } from 'helpers/nominate';
import useTransaction from 'helpers/useTransaction';

export type ActionCallbackType = () => void;
export interface DelegationPayloadType {
  amount: string;
}

const useStakeData = () => {
  const dispatch = useDispatch();
  const [check, setCheck] = useState(false);

  const { account, address } = useGetAccountInfo();
  const { sendTransaction } = useTransaction();
  const { pending } = useGetActiveTransactionsStatus();
  const { hasSuccessfulTransactions, successfulTransactionsArray } =
    useGetSuccessfulTransactions();
  const { contractDetails, userClaimableRewards, totalActiveStake } =
    useGlobalContext();

  const onDelegate =
    (callback: ActionCallbackType) =>
    async (data: DelegationPayloadType): Promise<void> => {
      try {
        await sendTransaction({
          value: data.amount,
          type: 'delegate',
          args: ''
        });

        setTimeout(callback, 250);
      } catch (error) {
        console.error(error);
      }
    };

  const onUndelegate =
    (callback: ActionCallbackType) =>
    async (data: DelegationPayloadType): Promise<void> => {
      try {
        await sendTransaction({
          value: '0',
          type: 'unDelegate',
          args: nominateValToHex(data.amount.toString())
        });

        setTimeout(callback, 250);
      } catch (error) {
        console.error(error);
      }
    };

  const onRedelegate =
    (callback: ActionCallbackType) => async (): Promise<void> => {
      try {
        await sendTransaction({
          value: '0',
          type: 'reDelegateRewards',
          args: ''
        });

        setTimeout(callback, 250);
      } catch (error) {
        console.error(error);
      }
    };

  const onClaimRewards =
    (callback: ActionCallbackType) => async (): Promise<void> => {
      try {
        await sendTransaction({
          value: '0',
          type: 'claimRewards',
          args: ''
        });

        setTimeout(callback, 250);
      } catch (error) {
        console.error(error);
      }
    };

  const getStakingLimits = () => {
    if (contractDetails.data && totalActiveStake.data) {
      const balance = new BigNumber(account.balance);
      const gasPrice = new BigNumber('12000000');
      const gasLimit = new BigNumber('12000000');
      const available = balance.minus(gasPrice.times(gasLimit));
      const dustful = available.minus(new BigNumber(minDust)).toFixed();

      if (contractDetails.data.withDelegationCap === 'true') {
        const cap = contractDetails.data.delegationCap;
        const stake = totalActiveStake.data;
        const remainder = new BigNumber(cap).minus(new BigNumber(stake));
        const maxed =
          parseInt(getPercentage(denominated(stake), denominated(cap))) >= 100;

        if (remainder.isGreaterThan(available)) {
          return {
            balance: available.toFixed(),
            limit: dustful,
            maxed
          };
        } else {
          return {
            balance: available.toFixed(),
            limit: remainder.gt(0) ? remainder.toFixed() : '0',
            maxed
          };
        }
      } else {
        return {
          balance: available.toFixed(),
          limit: dustful,
          maxed: false
        };
      }
    }

    return {
      balance: '',
      limit: ''
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
      const provider = new ProxyNetworkProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getClaimableRewards'),
        args: [new AddressValue(new Address(address))]
      });

      const data = await provider.queryContract(query);
      const [claimableRewards] = data.getReturnDataParts();

      dispatch({
        type: 'getUserClaimableRewards',
        userClaimableRewards: {
          status: 'loaded',
          error: null,
          data: claimableRewards
            ? denominated(decodeBigNumber(claimableRewards).toFixed(), {
                decimals: 4
              })
            : '0'
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
    if (hasSuccessfulTransactions && successfulTransactionsArray.length > 0) {
      getUserClaimableRewards();
    }
  };

  useEffect(fetchClaimableRewards, [userClaimableRewards.data]);
  useEffect(reFetchClaimableRewards, [
    hasSuccessfulTransactions,
    successfulTransactionsArray.length
  ]);

  useEffect(() => {
    if (pending && !check) {
      setCheck(true);

      return () => {
        setCheck(false);
      };
    }
  }, [pending]);

  return {
    onDelegate,
    onUndelegate,
    onRedelegate,
    onClaimRewards,
    getStakingLimits
  };
};

export default useStakeData;
