import { useState, useEffect } from 'react';
import {
  ContractFunction,
  ProxyProvider,
  Address,
  decodeBigNumber,
  Query
} from '@elrondnetwork/erdjs';
import { getEgldLabel } from '@elrondnetwork/dapp-core';
import { network } from 'config';

import getPercentage from '../helpers/getPercentage';

import { useDashboard } from '../provider';

const useDelegationCap = () => {
  const egldLabel = getEgldLabel();

  const { denominated } = useDashboard();
  const [value, setValue] = useState<string>('');
  const [percentage, setPercentage] = useState<string>('');

  const getDelegationCap = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const provider = new ProxyProvider(network.gatewayAddress);
        const queryData = (contract: string) =>
          new Query({
            address: new Address(network.delegationContract),
            func: new ContractFunction(contract)
          });

        const [config, stake] = await Promise.all([
          provider.queryContract(queryData('getContractConfig')),
          provider.queryContract(queryData('getTotalActiveStake'))
        ]);

        const [totalStake] = stake.outputUntyped();
        const contractDelegationCapIndex = 2;

        const formatted = {
          stake: denominated(decodeBigNumber(totalStake).toFixed()),
          value: denominated(
            decodeBigNumber(
              config.outputUntyped()[contractDelegationCapIndex]
            ).toFixed()
          )
        };

        setValue(`${formatted.value} ${egldLabel}`);
        setPercentage(
          `${getPercentage(formatted.stake, formatted.value)}% filled`
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => setValue('');
  };

  useEffect(getDelegationCap, [denominated, egldLabel]);

  return {
    value,
    percentage
  };
};

export default useDelegationCap;
