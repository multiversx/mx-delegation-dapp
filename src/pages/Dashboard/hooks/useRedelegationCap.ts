import { useState, useEffect } from 'react';

import { getAccountProvider } from '@elrondnetwork/dapp-core';
import {
  Query,
  ContractFunction,
  ProxyProvider,
  Address,
  decodeString,
  ChainID
} from '@elrondnetwork/erdjs';

import { network } from 'config';

import transact from '../helpers/transact';

const useRedelegationCap = () => {
  const [value, setValue] = useState<string>('');

  const getRedelegationCap = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const provider = new ProxyProvider(network.gatewayAddress);
        const query = new Query({
          address: new Address(network.delegationContract),
          func: new ContractFunction('getContractConfig')
        });

        const data = await provider.queryContract(query);
        const automaticActivationIndex = 7;
        const activationStatus = data.outputUntyped()[automaticActivationIndex];

        setValue(decodeString(activationStatus) === 'true' ? 'ON' : 'OFF');
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => setValue('');
  };

  const onSubmit = async (): Promise<void> => {
    try {
      const status = value === 'ON' ? 'false' : 'true';
      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };

      const payload = {
        args: Buffer.from(status).toString('hex'),
        chainId: new ChainID('T'),
        type: 'setReDelegateCapActivation',
        value: '0'
      };

      await transact(parameters, payload);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(getRedelegationCap, []);

  return {
    value,
    modal: {
      title: 'Check for ReDelegate Rewards Max Cap',
      description:
        'Set the check for ReDelegation Cap in order to block or accept the redelegate rewards.',
      status: `Currently is ${value}.`,
      button: `Turn ${value === 'ON' ? 'OFF' : 'ON'}`,
      onSubmit
    }
  };
};

export default useRedelegationCap;
