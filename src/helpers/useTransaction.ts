import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { getChainID, parseAmount } from '@multiversx/sdk-dapp/utils';

import {
  ContractFunction,
  Transaction,
  TransactionPayload,
  Address,
  SmartContract
} from '@multiversx/sdk-core';
import {
  network,
  DelegationContractType,
  delegationContractData
} from '/src/config';

interface TransactionParametersType {
  args: string;
  value: string;
  type: string;
}

const useTransaction = () => {
  const { account } = useGetAccountInfo();
  const chainID = getChainID();

  const sendTransaction = async ({
    args,
    value,
    type
  }: TransactionParametersType) => {
    const address = new Address(network.delegationContract);
    const contract = new SmartContract({ address });
    const delegable = delegationContractData.find(
      (item: DelegationContractType) => item.name === type
    );

    if (!delegable) {
      throw new Error('The contract for this action is not defined.');
    } else {
      const getFunctionName = (): string =>
        args === '' ? delegable.data : `${delegable.data}${args}`;

      const getGasLimit = (): number => {
        const nodeKeys = args.split('@').slice(1);

        return delegable.data === 'addNodes' && args
          ? delegable.gasLimit * (nodeKeys.length / 2)
          : delegable.gasLimit;
      };

      const data = TransactionPayload.contractCall()
        .setFunction(new ContractFunction(getFunctionName()))
        .build();

      const transaction = new Transaction({
        data,
        chainID: chainID.valueOf(),
        receiver: contract.getAddress(),
        value: value,
        gasLimit: getGasLimit(),
        nonce: account?.nonce,
        sender: new Address(account?.address)
      });

      return await sendTransactions({
        transactions: transaction
      });
    }
  };

  return {
    sendTransaction
  };
};

export default useTransaction;
