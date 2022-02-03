import {
  ContractFunction,
  Transaction,
  TransactionPayload,
  Balance,
  GasLimit,
  // WalletProvider,
  // WalletConnectProvider,
  // HWProvider,
  Address,
  SmartContract
} from '@elrondnetwork/erdjs';
import {
  network,
  DelegationContractType,
  delegationContractData
} from 'config';

interface TransactType {
  Arguments: {
    signer: any;
    account?: any;
  };
  Parameters: {
    args: string;
    value: string;
    type: string;
    chainId: any;
  };
}

const transact = async (
  { signer, account }: TransactType['Arguments'],
  { args, value, chainId, type }: TransactType['Parameters']
) => {
  // const providers = [WalletProvider, HWProvider, WalletConnectProvider];
  const address = new Address(network.delegationContract);
  const contract = new SmartContract({ address });
  const delegable = delegationContractData.find(
    (item: DelegationContractType) => item.name === type
  );

  if (!delegable) {
    throw new Error('The contract for this action is not defined');
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
      chainID: chainId,
      receiver: contract.getAddress(),
      value: Balance.egld(value),
      gasLimit: new GasLimit(getGasLimit()),
      nonce: account?.nonce
    });

    return await signer.sendTransaction(transaction);
  }
};

export default transact;
