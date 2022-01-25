import { useEffect, useState } from 'react';
import {
  decodeBigNumber,
  ContractFunction,
  ProxyProvider,
  Address,
  Query,
  ApiProvider
} from '@elrondnetwork/erdjs';
import { getEgldLabel } from '@elrondnetwork/dapp-core';
import { network } from 'config';

import getPercentage from '../helpers/getPercentage';

import { useDashboard } from '../provider';

const useContractStake = () => {
  const egldLabel = getEgldLabel();

  const { denominated } = useDashboard();
  const [percentage, setPercentage] = useState<string>('');
  const [value, setValue] = useState<string>('');

  const getContractStake = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const provider = new ProxyProvider(network.gatewayAddress);
        const query = new Query({
          address: new Address(network.delegationContract),
          func: new ContractFunction('getTotalActiveStake')
        });
        const API = new ApiProvider(network.apiAddress, {
          timeout: 4000
        });

        const [nodes, stake] = await Promise.all([
          provider.queryContract(query),
          API.getNetworkStake()
        ]);

        const [totalNodes] = nodes.outputUntyped();
        const formatted = {
          stake: denominated(stake.TotalStaked.toFixed()),
          nodes: denominated(decodeBigNumber(totalNodes).toFixed())
        };

        setValue(`${formatted.nodes} ${egldLabel}`);
        setPercentage(
          `${getPercentage(formatted.nodes, formatted.stake)}% of total stake`
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => setValue('');
  };

  useEffect(getContractStake, [denominated, egldLabel]);

  return {
    value,
    percentage
  };
};

export default useContractStake;
