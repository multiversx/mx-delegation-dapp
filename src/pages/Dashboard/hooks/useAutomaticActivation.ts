import { useState, useEffect } from 'react';
import {
  Query,
  ContractFunction,
  ProxyProvider,
  Address,
  decodeString,
  ChainID
} from '@elrondnetwork/erdjs';

import { getAccountProvider } from '@elrondnetwork/dapp-core';
import { network } from 'config';

import transact from '../helpers/transact';

const useAutomaticActivation = () => {
  const [value, setValue] = useState<string>('');

  const getAutomaticActivarion = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const provider = new ProxyProvider(network.gatewayAddress);
        const query = new Query({
          address: new Address(network.delegationContract),
          func: new ContractFunction('getContractConfig')
        });

        const data = await provider.queryContract(query);
        const automaticActivationIndex = 4;
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
        type: 'setAutomaticActivation',
        value: '0'
      };

      await transact(parameters, payload);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(getAutomaticActivarion, []);

  return {
    value,
    modal: {
      title: 'Automatic Activation',
      description: 'Set automatic activation',
      status: `Currently is ${value}.`,
      button: `Turn ${value === 'ON' ? 'OFF' : 'ON'}`,
      onSubmit
    }
  };
};

export default useAutomaticActivation;
