import {
  getChainID,
  transactionServices,
  useGetAccountInfo
} from '@elrondnetwork/dapp-core';
import {
  ContractFunction,
  Transaction,
  TransactionPayload,
  Balance,
  GasLimit,
  ChainID,
  Address,
  Nonce,
  SmartContract
} from '@elrondnetwork/erdjs';
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
        chainID: new ChainID(chainID.valueOf()),
        receiver: contract.getAddress(),
        value: Balance.egld(value),
        gasLimit: new GasLimit(getGasLimit()),
        nonce: new Nonce(account?.nonce)
      });

      return await transactionServices.sendTransactions({
        transactions: transaction
      });
    }
  };

  return {
    sendTransaction
  };
};

export default useTransaction;
