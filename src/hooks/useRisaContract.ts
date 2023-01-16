import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { getChainID, parseAmount } from '@multiversx/sdk-dapp/utils';
import {
  ProxyNetworkProvider,
  ApiNetworkProvider
} from '@multiversx/sdk-network-providers';

import {
  Address,
  SmartContract,
  AbiRegistry,
  SmartContractAbi,
  ResultsParser,
  Interaction,
  AddressValue
} from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';
import { network } from '/src/config';

import abiFile from '../assets/abi/risa-staking-contract.json';

interface UnstakeRisaParametersType {
  amount: string;
}
export interface StakeSettingsType {
  token_id: string;
  min_stake_limit: BigNumber;
  lock_period: BigNumber;
  claim_lock_period: BigNumber;
  base_apr: BigNumber;
  breakpoint_durations: BigNumber[];
  breakpoint_multipliers: BigNumber[];
  total_staked_amount: BigNumber;
  number_of_stakers: BigNumber;
}

export interface StakeAccountType {
  address: Address;
  staked_amount: BigNumber;
  initial_staked_timestamp: BigNumber;
  last_staked_timestamp: BigNumber;
  reward_amount: BigNumber;
  last_claim_timestamp: BigNumber;
  last_updated_tier: BigNumber;
  last_update_timestamp: BigNumber;
  current_apr: BigNumber;
  current_multiplier: BigNumber;
  current_tier: BigNumber;
}
const useRisaContract = () => {
  const networkProvider = new ProxyNetworkProvider(network.gatewayAddress);
  const abiRegistry = AbiRegistry.create(abiFile);
  const abi = new SmartContractAbi(abiRegistry, ['OdinRisaStake']);
  const contract = new SmartContract({
    address: new Address(network.risaStakingContract),
    abi: abi
  });
  let resultsParser = new ResultsParser();
  const { account, address: userAddress } = useGetAccountInfo();
  const chainID = getChainID();

  const unstake = async ({ amount }: UnstakeRisaParametersType) => {
    let tx = contract.methods
      .unstake([amount])
      .withNonce(account?.nonce)
      .withValue('0')
      .withGasLimit(6000000)
      .withChainID(chainID.valueOf())
      .buildTransaction();

    return await sendTransactions({
      transactions: tx
    });
  };

  const restake = async () => {
    let tx = contract.methods
      .restake()
      .withNonce(account?.nonce)
      .withValue('0')
      .withGasLimit(6000000)
      .withChainID(chainID.valueOf())
      .buildTransaction();

    return await sendTransactions({
      transactions: tx
    });
  };

  const claim = async () => {
    let tx = contract.methods
      .claim()
      .withNonce(account?.nonce)
      .withValue('0')
      .withGasLimit(6000000)
      .withChainID(chainID.valueOf())
      .buildTransaction();

    return await sendTransactions({
      transactions: tx
    });
  };

  const getStakeSettings = async (): Promise<StakeSettingsType> => {
    let interaction = <Interaction>contract.methods.viewStakeSetting();
    let query = interaction.check().buildQuery();
    let queryResponse = await networkProvider.queryContract(query);
    let endpointDefinition = interaction.getEndpoint();
    let { firstValue } = resultsParser.parseQueryResponse(
      queryResponse,
      endpointDefinition
    );
    return firstValue?.valueOf() as StakeSettingsType;
  };

  const getStakeAccount = async (): Promise<StakeAccountType> => {
    let interaction = <Interaction>(
      contract.methods.viewStakeAccount([userAddress])
    );
    let query = interaction.check().buildQuery();
    let queryResponse = await networkProvider.queryContract(query);
    let endpointDefinition = interaction.getEndpoint();
    let { firstValue } = resultsParser.parseQueryResponse(
      queryResponse,
      endpointDefinition
    );
    return firstValue?.valueOf() as StakeAccountType;
  };

  return {
    unstake,
    restake,
    claim,
    getStakeSettings,
    getStakeAccount
  };
};

export default useRisaContract;
