import { Address, SmartContract, TokenPayment } from '@multiversx/sdk-core';
import { sendTransactions } from '@multiversx/sdk-dapp/services/transactions/sendTransactions';
import {
  network,
  DelegationContractType,
  delegationContractData
} from 'config';

interface TransactionParametersType {
  args: string;
  value: string;
  type: string;
}

const useTransaction = () => {
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

      const transaction = {
        value: TokenPayment.egldFromAmount(value),
        data: getFunctionName(),
        receiver: contract.getAddress().bech32(),
        gasLimit: getGasLimit()
      };

      return await sendTransactions({
        transactions: [transaction]
      });
    }
  };

  return {
    sendTransaction
  };
};

export default useTransaction;
