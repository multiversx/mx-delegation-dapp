import { useState, useEffect } from 'react';
import {
  AddressValue,
  ContractFunction,
  ApiProvider,
  ProxyProvider,
  Address,
  decodeString,
  Query
} from '@elrondnetwork/erdjs';
import { network } from 'config';

import getPercentage from '../helpers/getPercentage';

const useNodeNumber = () => {
  const [value, setValue] = useState<string>('');
  const [percentage, setPercentage] = useState<string>('');

  const getNodeNumber = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const [node, stake] = await Promise.all([
          new ProxyProvider(network.gatewayAddress).queryContract(
            new Query({
              address: new Address(network.auctionContract),
              func: new ContractFunction('getBlsKeysStatus'),
              args: [new AddressValue(new Address(network.delegationContract))]
            })
          ),
          new ApiProvider(network.apiAddress, {
            timeout: 4000
          }).getNetworkStake()
        ]);

        const data = {
          stake: stake.TotalValidators.toString(),
          nodes: node
            .outputUntyped()
            .filter((key) => decodeString(key) === 'staked')
            .length.toString()
        };

        setValue(data.nodes);
        setPercentage(
          `${getPercentage(data.nodes, data.stake)}% of total nodes`
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => setValue('');
  };

  useEffect(getNodeNumber, []);

  return {
    value,
    percentage
  };
};

export default useNodeNumber;
