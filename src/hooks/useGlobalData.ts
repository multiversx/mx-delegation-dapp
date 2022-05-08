import { useEffect } from 'react';

import {
  useGetAccountInfo,
  transactionServices
} from '@elrondnetwork/dapp-core';
import {
  Query,
  ProxyProvider,
  ContractFunction,
  Address,
  decodeBigNumber,
  decodeUnsignedNumber,
  decodeString,
  AddressValue
} from '@elrondnetwork/erdjs';

import { network, auctionContract } from 'config';
import { useDispatch } from 'context';

interface ContractDetailsType {
  automaticActivation: string;
  redelegationCap: string;
  serviceFee: string;
  delegationCap: string;
  owner: boolean;
  withDelegationCap: string;
}

interface globalFetchesType {
  [key: string]: any;
  getContractDetails: {
    key: string;
    handler: () => Promise<ContractDetailsType | string>;
  };
  getNodesNumber: {
    key: string;
    handler: () => Promise<Array<Buffer> | string>;
  };
  getTotalActiveStake: {
    key: string;
    handler: () => Promise<string>;
  };
  getUserActiveStake: {
    key: string;
    handler: () => Promise<string>;
  };
  getNetworkConfig: {
    key: string;
    handler: () => Promise<any>;
  };
}

const useGlobalData = () => {
  const { address } = useGetAccountInfo();
  const { successfulTransactionsArray } =
    transactionServices.useGetSuccessfulTransactions();

  const dispatch = useDispatch();
  const provider = new ProxyProvider(network.gatewayAddress);
  const criticalFetches: globalFetchesType = {
    getContractDetails: {
      key: 'contractDetails',
      handler: async (): Promise<ContractDetailsType | string> => {
        try {
          const query = new Query({
            address: new Address(network.delegationContract),
            func: new ContractFunction('getContractConfig')
          });

          const data = await provider.queryContract(query);
          const response = data.outputUntyped();

          const ownerAddressIndex = 0;
          const serviceFeeIndex = 1;
          const delegationCapIndex = 2;
          const automaticActivationIndex = 4;
          const withDelegationCapIndex = 5;
          const redelegationCapIndex = 7;

          const ownerAddress = response[ownerAddressIndex];
          const serviceFee = response[serviceFeeIndex];
          const delegationCap = response[delegationCapIndex];
          const activationStatus = response[automaticActivationIndex];
          const withDelegationCap = response[withDelegationCapIndex];
          const redelegationCap = response[redelegationCapIndex];

          return {
            withDelegationCap: String(withDelegationCap),
            owner: new Address(address).hex() === ownerAddress.toString('hex'),
            delegationCap: decodeBigNumber(delegationCap).toFixed(),
            redelegationCap:
              decodeString(redelegationCap) === 'true' ? 'ON' : 'OFF',
            serviceFee:
              (decodeUnsignedNumber(serviceFee) / 100).toString() + '%',
            automaticActivation:
              decodeString(activationStatus) === 'true' ? 'ON' : 'OFF'
          };
        } catch (error) {
          return Promise.reject(error);
        }
      }
    },
    getNodesNumber: {
      key: 'nodesNumber',
      handler: async (): Promise<Array<Buffer> | string> => {
        try {
          const query = new Query({
            address: new Address(auctionContract),
            func: new ContractFunction('getBlsKeysStatus'),
            args: [new AddressValue(new Address(network.delegationContract))]
          });

          const data = await provider.queryContract(query);
          const response = data.outputUntyped();

          return response;
        } catch (error) {
          return Promise.reject(error);
        }
      }
    },
    getTotalActiveStake: {
      key: 'totalActiveStake',
      handler: async (): Promise<string> => {
        try {
          const query = new Query({
            address: new Address(network.delegationContract),
            func: new ContractFunction('getTotalActiveStake')
          });

          const data = await provider.queryContract(query);
          const [totalNodes] = data.outputUntyped();

          return decodeBigNumber(totalNodes).toFixed();
        } catch (error) {
          return Promise.reject(error);
        }
      }
    },
    getUserActiveStake: {
      key: 'userActiveStake',
      handler: async (): Promise<string> => {
        try {
          const query = new Query({
            address: new Address(network.delegationContract),
            func: new ContractFunction('getUserActiveStake'),
            args: [new AddressValue(new Address(address))]
          });

          const data = await provider.queryContract(query);
          const [userStake] = data.outputUntyped();

          return decodeBigNumber(userStake).toFixed();
        } catch (error) {
          return Promise.reject(error);
        }
      }
    },
    getNetworkConfig: {
      key: 'networkConfig',
      handler: async (): Promise<any> => {
        try {
          return await provider.getNetworkConfig();
        } catch (error) {
          return Promise.reject(error);
        }
      }
    }
  };

  const fetchCriticalData = (): void => {
    const fetchData = async () => {
      const keys = Object.keys(criticalFetches);

      keys.forEach((key) => {
        dispatch({
          type: key,
          [criticalFetches[key].key]: {
            status: 'loading',
            data: null,
            error: null
          }
        });
      });

      const data = await Promise.allSettled(
        keys.map((key: string) => criticalFetches[key].handler())
      );

      data.forEach((item: any, index: any) => {
        dispatch({
          type: keys[index],
          [criticalFetches[keys[index]].key]: {
            status: item.status === 'rejected' ? 'error' : 'loaded',
            error: item.reason || null,
            data: item.value || null
          }
        });
      });
    };

    fetchData();
  };

  useEffect(fetchCriticalData, [successfulTransactionsArray.length]);
};

export default useGlobalData;
