import { useEffect } from 'react';
import { ProxyNetworkProvider, ApiNetworkProvider } from "@elrondnetwork/erdjs-network-providers";
import { useGetAccountInfo, useGetActiveTransactionsStatus } from '@elrondnetwork/dapp-core/hooks';

import {
  Address,
  AddressValue,
  Query,
  ContractFunction,
  decodeBigNumber,
  ResultsParser,
  AbiRegistry,
  SmartContractAbi,
  SmartContract
} from '@elrondnetwork/erdjs';
import BigNumber from 'bignumber.js';

import { network, minDust } from '/src/config';
import { useDispatch, useGlobalContext } from '/src/context';
import { denominate } from '/src/helpers/denominate';
import getPercentage from '/src/helpers/getPercentage';
import { nominateValToHex } from '/src/helpers/nominate';
import useTransaction from '/src/helpers/useTransaction';

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


      let response = await fetch("/risa-staking-contract.json");
      let abiRegistry = AbiRegistry.create(await response.json());
      let abi = new SmartContractAbi(abiRegistry, ["OdinRisaStake"]);
      let contract = new SmartContract({ address: new Address(network.risaStakingContract), abi: abi });
      const provider = new ProxyNetworkProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.risaStakingContract),
        func: new ContractFunction('getClaimableRewards'),
        args: [new AddressValue(new Address(address))]
      });
      let queryResponse = await provider.queryContract(query);
      let endpointDefinition = contract.getEndpoint("getClaimableRewards");
      let { firstValue, secondValue, returnCode } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
debugger
      dispatch({
        type: 'getUserClaimableRewards',
        userClaimableRewards: {
          status: 'loaded',
          error: null,
          data: denominate({
            input: decodeBigNumber(firstValue).toFixed(),
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
    onClaimRewards
  };
};

export default useStakeData;
