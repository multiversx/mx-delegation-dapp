import denominate from 'pages/Dashboard/helpers/denominate';

import {
  ContractFunction,
  ProxyProvider,
  Address,
  Query
} from '@elrondnetwork/erdjs';

import { getAddress } from '@elrondnetwork/dapp-core';
import { decimals, denomination } from 'config';
import { useState, useEffect } from 'react';
import { network } from 'config';

const useClient = () => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [adminEnabled, setAdminEnabled] = useState<boolean>(false);

  const getPermissions = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const provider = new ProxyProvider(network.gatewayAddress);
        const query = new Query({
          address: new Address(network.delegationContract),
          func: new ContractFunction('getContractConfig')
        });

        const [ownerAddressData, userAddressData] = await Promise.all([
          provider.queryContract(query),
          getAddress()
        ]);

        const ownerAddressIndex = 0;
        const [ownerAddress, userAddress] = [
          ownerAddressData.outputUntyped()[ownerAddressIndex].toString('hex'),
          new Address(userAddressData).hex()
        ];

        setIsOwner(ownerAddress === userAddress);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => setIsOwner(false);
  };

  useEffect(getPermissions, []);

  return {
    isOwner,
    adminEnabled,
    setAdminEnabled,
    denominated: (input: string, parameters?: any): string =>
      denominate({
        input,
        denomination,
        decimals,
        ...parameters
      })
  };
};

export default useClient;
