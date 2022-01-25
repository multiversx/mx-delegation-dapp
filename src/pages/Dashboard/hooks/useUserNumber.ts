import { useState, useEffect } from 'react';
import {
  decodeUnsignedNumber,
  ContractFunction,
  ProxyProvider,
  Address,
  Query
} from '@elrondnetwork/erdjs';
import { network } from 'config';

const useUserNumber = () => {
  const [value, setValue] = useState<string>('');

  const getUserNumber = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const provider = new ProxyProvider(network.gatewayAddress);
        const query = new Query({
          address: new Address(network.delegationContract),
          func: new ContractFunction('getNumUsers')
        });

        const data = await provider.queryContract(query);
        const [userNumber] = data.outputUntyped();

        setValue(decodeUnsignedNumber(userNumber).toString());
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => setValue('');
  };

  useEffect(getUserNumber, []);

  return {
    value
  };
};

export default useUserNumber;
