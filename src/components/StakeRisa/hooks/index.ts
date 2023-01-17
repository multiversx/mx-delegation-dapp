import React, { useEffect, useState } from 'react';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { getChainID } from '@multiversx/sdk-dapp/utils';
import {
  useGetAccountInfo,
  useGetActiveTransactionsStatus
} from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import {
  Address,
  AddressValue,
  Query,
  ContractFunction,
  ResultsParser,
  AbiRegistry,
  SmartContractAbi,
  SmartContract,
  TokenPayment
} from '@multiversx/sdk-core';
import { network } from '/src/config';
import { useDispatch, useGlobalContext } from '/src/context';

import abiFile from '../../../assets/abi/risa-staking-contract.json';
import { formatAmount } from '@multiversx/sdk-dapp/utils/operations/formatAmount';
import useRisaContract from '/src/hooks/useRisaContract';
import {
  StakeSettingsType,
  StakeAccountType
} from '/src/hooks/useRisaContract';

interface StakePayloadType {
  amount: string;
}
interface UnstakePayloadType {
  amount: string;
}
const useStakeData = () => {
  const dispatch = useDispatch();
  const [shouldReload, setShouldReload] = useState(false);
  const [stakeSettings, setStakeSettings]: [
    StakeSettingsType,
    React.Dispatch<any>
  ] = useState<StakeSettingsType>();
  const [stakeAccount, setStakeAccount]: [
    StakeAccountType,
    React.Dispatch<any>
  ] = useState<StakeAccountType>();

  const { account, address } = useGetAccountInfo();
  const { unstake, restake, claim, getStakeSettings, getStakeAccount } =
    useRisaContract();

  const { userClaimableRisaRewards, userActiveRisaStake } = useGlobalContext();
  const { success, pending } = useGetActiveTransactionsStatus();

  const chainID = getChainID();
  const abiRegistry = AbiRegistry.create(abiFile);
  const abi = new SmartContractAbi(abiRegistry, ['OdinRisaStake']);
  const contract = new SmartContract({
    address: new Address(network.risaStakingContract),
    abi: abi
  });

  const onStake = async (payload: StakePayloadType): Promise<void> => {
    try {
      const tokenPayment = TokenPayment.fungibleFromAmount(
        network.risaTokenId,
        payload.amount,
        18
      );

      const tx = contract.methods
        .stake()
        .withSingleESDTTransfer(tokenPayment)
        .withNonce(account?.nonce)
        .withGasLimit(10000000)
        .withChainID(chainID)
        .buildTransaction();

      return await sendTransactions({
        transactions: tx
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onUnstake = async (payload: UnstakePayloadType): Promise<void> => {
    try {
      await unstake({
        amount: payload.amount + '00' // 50% = 5000
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onRestake = async (): Promise<void> => {
    try {
      await restake();
    } catch (error) {
      console.error(error);
    }
  };

  const onClaimRewards = async (): Promise<void> => {
    try {
      await claim();
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
        func: new ContractFunction('getClaimableRewards'),
        args: [new AddressValue(new Address(address))]
      });
      let queryResponse = await provider.queryContract(query);
      let endpointDefinition = contract.getEndpoint('getClaimableRewards');
      let { firstValue, secondValue, returnCode } =
        new ResultsParser().parseQueryResponse(
          queryResponse,
          endpointDefinition
        );

      dispatch({
        type: 'getUserClaimableRisaRewards',
        userClaimableRisaRewards: {
          status: 'loaded',
          error: null,
          data: formatAmount({
            input: firstValue?.valueOf().toFixed(),
            digits: 0,
            showLastNonZeroDecimal: false,
            addCommas: true
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
            input: firstValue?.valueOf().toFixed(),
            digits: 0,
            showLastNonZeroDecimal: false,
            addCommas: true
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

  const refetchData = () => {
    if (success && shouldReload) {
      getRisaRewards();
      getUserActiveRisaStake();
      fetchContractData();
    }
  };

  const fetchContractData = () => {
    async function fetchData() {
      setStakeSettings(await getStakeSettings());
      setStakeAccount(await getStakeAccount());
    }
    fetchData();
  };

  useEffect(fetchRisaRewards, [userClaimableRisaRewards.data]);
  useEffect(refetchData, [success, shouldReload]);

  useEffect(fetchContractData, [userClaimableRisaRewards.data]);

  useEffect(() => {
    if (pending && !shouldReload) {
      setShouldReload(true);

      return () => {
        setShouldReload(false);
      };
    }
  }, [pending]);

  return {
    onStake,
    onUnstake,
    onRestake,
    onClaimRewards,
    stakeAccount,
    stakeSettings
  };
};

export default useStakeData;
