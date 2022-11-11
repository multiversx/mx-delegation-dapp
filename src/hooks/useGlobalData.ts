import { useEffect } from 'react';
import { ProxyNetworkProvider, ApiNetworkProvider } from "@elrondnetwork/erdjs-network-providers";
import { useGetAccountInfo, useGetSuccessfulTransactions } from '@elrondnetwork/dapp-core/hooks';
import {
  Query,
  ContractFunction,
  Address,
  decodeBigNumber,
  decodeUnsignedNumber,
  decodeString,
  AddressValue,
  ResultsParser
} from '@elrondnetwork/erdjs';

import { network, auctionContract } from '/src/config';
import { useDispatch } from '/src/context';

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
  getNodesStates: {
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
  const { successfulTransactionsArray } = useGetSuccessfulTransactions();

  const dispatch = useDispatch();
  const provider = new ProxyNetworkProvider(network.gatewayAddress);
  const criticalFetches: globalFetchesType = {
    getContractDetails: {
      key: 'contractDetails',
      handler: async (): Promise<ContractDetailsType | string> => {
        try {
          const query = new Query({
            address: new Address(network.delegationContract),
            func: new ContractFunction('getContractConfig')
          });
          
          const queryResponse = await provider.queryContract(query);
          const {values} = new ResultsParser().parseUntypedQueryResponse(queryResponse);

          const ownerAddress = values[0];
          const serviceFee = values[1];
          const delegationCap = values[2];
          const activationStatus = values[4];
          const withDelegationCap = values[5];
          const redelegationCap = values[7];
debugger
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

          const queryResponse = await provider.queryContract(query);
          const {values} = new ResultsParser().parseUntypedQueryResponse(queryResponse);

          return values;
        } catch (error) {
          return Promise.reject(error);
        }
      }
    },
    getNodesStates: {
      key: 'nodesStates',
      handler: async (): Promise<Array<Buffer> | string> => {
        try {
          const query = new Query({
            address: new Address(network.delegationContract),
            func: new ContractFunction('getAllNodeStates')
          });

          const queryResponse = await provider.queryContract(query);
          const {values} = new ResultsParser().parseUntypedQueryResponse(queryResponse);

          return values;
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

          const queryResponse = await provider.queryContract(query);
          const {values} = new ResultsParser().parseUntypedQueryResponse(queryResponse);

          return decodeBigNumber(values[0]).toFixed();
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

          const queryResponse = await provider.queryContract(query);
          const {values} = new ResultsParser().parseUntypedQueryResponse(queryResponse);

          return decodeBigNumber(values[0]).toFixed();
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
