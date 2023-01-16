import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { getChainID, parseAmount } from '@multiversx/sdk-dapp/utils';

import {
  Address,
  SmartContract,
  AbiRegistry,
  SmartContractAbi
} from '@multiversx/sdk-core';
import {
  network
} from '/src/config';

import abiFile from '../assets/abi/risa-staking-contract.json';

interface UnstakeRisaParametersType {
  amount: string;
}

const useRisaContract = () => {
  const abiRegistry = AbiRegistry.create(abiFile);
  const abi = new SmartContractAbi(abiRegistry, ['OdinRisaStake']);
  const contract = new SmartContract({
    address: new Address(network.risaStakingContract),
    abi: abi
  });
  const { account } = useGetAccountInfo();
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

  return {
    unstake,
    restake,
    claim
  };
};

export default useRisaContract;
