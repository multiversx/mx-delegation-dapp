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
  ResultsParser,
  AbiRegistry,
  SmartContractAbi,
  SmartContract,
  BigUIntType,
  U32Type,
  U64Type
} from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';

import { network, minDust } from '/src/config';
import { useDispatch, useGlobalContext } from '/src/context';
import getPercentage from '/src/helpers/getPercentage';
import { nominateValToHex } from '/src/helpers/nominate';
import useTransaction from '/src/helpers/useTransaction';
import { parseAmount } from '@multiversx/sdk-dapp/utils/operations/parseAmount';

import abiFile from '../../../assets/abi/risa-staking-contract.json';
import { formatAmount } from '@multiversx/sdk-dapp/utils/operations/formatAmount';

interface DelegationPayloadType {
  amount: string;
}
interface StakeAccount {
  address: Address;
  staked_amount: BigUIntType;
  initial_staked_timestamp: U64Type;
  last_staked_timestamp: U64Type;
  reward_amount: BigUIntType;
  last_claim_timestamp: U64Type;
  last_updated_tier: U32Type;
  last_update_timestamp: U64Type;
  current_apr: U64Type;
  current_multiplier: U64Type;
  current_tier: U32Type;
}
const useStakeData = () => {
  const dispatch = useDispatch();

  const { account, address } = useGetAccountInfo();
  const { sendTransaction } = useTransaction();

  const { userClaimableRisaRewards, userActiveRisaStake } = useGlobalContext();
  const { success, pending } = useGetActiveTransactionsStatus();

  const onStake = async (data: DelegationPayloadType): Promise<void> => {
    try {
      await sendTransaction({
        value: parseAmount(data.amount, 18),
        type: 'stake',
        args: ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onUnstake = async (data: DelegationPayloadType): Promise<void> => {
    try {
      await sendTransaction({
        value: '0',
        type: 'unstake',
        args: nominateValToHex(data.amount.toString())
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onRestake = async (): Promise<void> => {
    try {
      await sendTransaction({
        value: '0',
        type: 'restake',
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
        type: 'claim',
        args: ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getRisaRewards = async (): Promise<void> => {
    dispatch({
      type: 'getUserClaimableRisaRewards',
      userClaimableRisaRewards: {
        status: 'loading',
        data: null,
        error: null
      }
    });

    try {
      let abiRegistry = AbiRegistry.create(abiFile);
      let abi = new SmartContractAbi(abiRegistry, ['OdinRisaStake']);
      let contract = new SmartContract({
        address: new Address(network.risaStakingContract),
        abi: abi
      });
      const provider = new ProxyNetworkProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.risaStakingContract),
        func: new ContractFunction('viewStakeAccount'),
        args: [new AddressValue(new Address(address))]
      });
      let queryResponse = await provider.queryContract(query);
      let endpointDefinition = contract.getEndpoint('viewStakeAccount');
      let { firstValue, secondValue, returnCode } =
        new ResultsParser().parseQueryResponse(
          queryResponse,
          endpointDefinition
        );
      let stakeAccount = <StakeAccount>firstValue?.valueOf();

      dispatch({
        type: 'getUserClaimableRisaRewards',
        userClaimableRisaRewards: {
          status: 'loaded',
          error: null,
          data: formatAmount({
            input: parseAmount(stakeAccount.reward_amount.toFixed())
          })
        }
      });
    } catch (error) {
      dispatch({
        type: 'getUserClaimableRisaRewards',
        userClaimableRisaRewards: {
          status: 'error',
          data: null,
          error
        }
      });
    }
  };

  const getUserActiveRisaStake = async (): Promise<void> => {
    dispatch({
      type: 'getUserActiveRisaStake',
      userActiveRisaStake: {
        status: 'loading',
        data: null,
        error: null
      }
    });

    try {
      let abiRegistry = AbiRegistry.create(abiFile);
      let abi = new SmartContractAbi(abiRegistry, ['OdinRisaStake']);
      let contract = new SmartContract({
        address: new Address(network.risaStakingContract),
        abi: abi
      });
      const provider = new ProxyNetworkProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.risaStakingContract),
        func: new ContractFunction('getStakedAmount'),
        args: [new AddressValue(new Address(address))]
      });
      let queryResponse = await provider.queryContract(query);
      let endpointDefinition = contract.getEndpoint('getStakedAmount');
      let { firstValue, secondValue, returnCode } =
        new ResultsParser().parseQueryResponse(
          queryResponse,
          endpointDefinition
        );
      dispatch({
        type: 'getUserActiveRisaStake',
        userActiveRisaStake: {
          status: 'loaded',
          error: null,
          data: formatAmount({
            input: parseAmount(firstValue?.valueOf().toFixed())
          })
        }
      });
    } catch (error) {
      dispatch({
        type: 'getUserActiveRisaStake',
        userActiveRisaStake: {
          status: 'error',
          data: null,
          error
        }
      });
    }
  };

  const fetchRisaRewards = () => {
    if (!userClaimableRisaRewards.data) {
      getRisaRewards();
    }
    if (!userActiveRisaStake.data) {
      getUserActiveRisaStake();
    }
  };

  const reFetchRisaRewards = () => {
    if (success && pending && userClaimableRisaRewards.data) {
      getRisaRewards();
    }

    if (success && pending && userActiveRisaStake.data) {
      getUserActiveRisaStake();
    }
  };

  useEffect(fetchRisaRewards, [userClaimableRisaRewards.data]);
  useEffect(reFetchRisaRewards, [success, pending]);

  return {
    onStake,
    onUnstake,
    onRestake,
    onClaimRewards
  };
};

export default useStakeData;
