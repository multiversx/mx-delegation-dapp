import { useState, useEffect } from 'react';
import {
  Query,
  ContractFunction,
  ProxyProvider,
  Address,
  decodeUnsignedNumber
} from '@elrondnetwork/erdjs';
import { network } from 'config';

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

  useEffect(getServiceFee, []);

  return {
    value
  };
};

export default useServiceFee;
