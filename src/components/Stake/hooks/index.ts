import { useEffect } from 'react';
import {
  ProxyNetworkProvider,
  ApiNetworkProvider
} from '@multiversx/sdk-network-providers';
import {
  useGetAccountInfo,
  useGetActiveTransactionsStatus
} from '@multiversx/sdk-dapp/hooks';

import {
  Address,
  AddressValue,
  Query,
  ContractFunction,
  decodeBigNumber,
  ResultsParser
} from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';

import { network, minDust } from '/src/config';
import { useDispatch, useGlobalContext } from '/src/context';
import { denominate } from '/src/helpers/denominate';
import getPercentage from '/src/helpers/getPercentage';
import { nominateValToHex } from '/src/helpers/nominate';
import useTransaction from '/src/helpers/useTransaction';
import { parseAmount } from '@multiversx/sdk-dapp/utils/operations/parseAmount';

interface DelegationPayloadType {
  amount: string;
}

const useStakeData = () => {
  const dispatch = useDispatch();

  const { account, address } = useGetAccountInfo();
  const { sendTransaction } = useTransaction();
  const { contractDetails, userClaimableRewards, totalActiveStake } =
    useGlobalContext();
  const { success, pending } = useGetActiveTransactionsStatus();

  const onDelegate = async (data: DelegationPayloadType): Promise<void> => {
    try {
      await sendTransaction({
        value: parseAmount(data.amount, 18),
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
          parseInt(
            getPercentage(
              denominate({ input: stake || '0' }),
              denominate({ input: cap || '0' })
            )
          ) === 100;

        if (remainder.isGreaterThan(available)) {
          return {
            balance: available.toFixed(),
            limit: dustful,
            maxed
          };
        } else {
          return {
            balance: available.toFixed(),
            limit: remainder.toFixed(),
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

      const queryResponse = await provider.queryContract(query);
      const { values } = new ResultsParser().parseUntypedQueryResponse(
        queryResponse
      );

      dispatch({
        type: 'getUserClaimableRewards',
        userClaimableRewards: {
          status: 'loaded',
          error: null,
          data: denominate({
            input: decodeBigNumber(values[0]).toFixed(),
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
    if (success && pending && userClaimableRewards.data) {
      getUserClaimableRewards();
    }
  };

  useEffect(fetchClaimableRewards, [userClaimableRewards.data]);
  useEffect(reFetchClaimableRewards, [success, pending]);

  return {
    onDelegate,
    onUndelegate,
    onRedelegate,
    onClaimRewards,
    getStakingLimits
  };
};

export default useStakeData;
