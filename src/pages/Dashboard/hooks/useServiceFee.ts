import { useState, useEffect } from 'react';
import { getAccountProvider } from '@elrondnetwork/dapp-core';

import {
  Query,
  ContractFunction,
  ProxyProvider,
  Address,
  ChainID,
  decodeUnsignedNumber
} from '@elrondnetwork/erdjs';
import { object, string } from 'yup';
import { network } from 'config';
import { nominateVal } from 'pages/Dashboard/helpers/nominate';

import transact from 'pages/Dashboard/helpers/transact';

interface ActionDataType {
  amount: string;
}

const useServiceFee = () => {
  const [value, setValue] = useState<string>('');

  const getServiceFee = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const provider = new ProxyProvider(network.gatewayAddress);
        const query = new Query({
          address: new Address(network.delegationContract),
          func: new ContractFunction('getContractConfig')
        });

        const data = await provider.queryContract(query);
        const serviceFeeIndex = 1;

        setValue(
          (
            decodeUnsignedNumber(data.outputUntyped()[serviceFeeIndex]) / 100
          ).toString() + '%'
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => setValue('');
  };

  const onSubmit = async ({ amount }: ActionDataType): Promise<void> => {
    try {
      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };
      const payload = {
        args: nominateVal(amount),
        chainId: new ChainID('T'),
        type: 'changeServiceFee',
        value: '0'
      };
      await transact(parameters, payload);
    } catch (error) {
      console.error(error);
    }
  };

  const validation = object().shape({
    amount: string()
      .required('Required')
      .test(
        'minimum',
        'Minimum fee percentage is 0.01',
        (value) => parseFloat(value || '') > 0
      )
      .test(
        'minimum',
        'Maximum fee percentage is 100',
        (value) => parseFloat(value || '') <= 100
      )
  });

  useEffect(getServiceFee, []);

  return {
    value,
    modal: {
      title: 'Change service fee',
      description:
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      button: 'Continue',
      onSubmit,
      input: {
        label: 'Add the percentage fee',
        description: 'For example: 12.30',
        validation
      }
    }
  };
};

export default useServiceFee;
