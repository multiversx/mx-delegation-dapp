import { useGetAccountInfo, getNetworkProxy } from '@elrondnetwork/dapp-core';
import {
  decodeUnsignedNumber,
  ContractFunction,
  ProxyProvider,
  ApiProvider,
  AddressValue,
  Address,
  Query,
  decodeString,
  decodeBigNumber
} from '@elrondnetwork/erdjs';
import { network, decimals, denomination } from 'config';
import denominate from 'helpers/denominate';

interface ContractDetailsType {
  ownerAddress: string;
  automaticActivation: string;
  redelegationCap: string;
  serviceFee: string;
  delegationCap: string;
}

interface AgencyMetaDataType {
  name: string;
  website: string;
  keybase: string;
}

export interface UndelegateStakeListType {
  value: string;
  timeLeft: number;
}

// move to services folder useSharedData

const useCallbacks = () => {
  const { account, address } = useGetAccountInfo();
  const provider = new ProxyProvider(network.gatewayAddress);

  const getUsersNumber = async (): Promise<string | undefined> => {
    try {
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getNumUsers')
      });

      const data = await provider.queryContract(query);
      const [userNumber] = data.outputUntyped();

      return decodeUnsignedNumber(userNumber).toString();
    } catch (error) {
      console.error(error);
    }
  };

  const getContractDetails = async (): Promise<
    ContractDetailsType | undefined
  > => {
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
      const redelegationCapIndex = 7;

      const ownerAddress = response[ownerAddressIndex];
      const serviceFee = response[serviceFeeIndex];
      const delegationCap = response[delegationCapIndex];
      const activationStatus = response[automaticActivationIndex];
      const redelegationCap = response[redelegationCapIndex];

      return {
        delegationCap: decodeBigNumber(delegationCap).toFixed(),
        ownerAddress: ownerAddress.toString('hex'),
        redelegationCap:
          decodeString(redelegationCap) === 'true' ? 'ON' : 'OFF',
        serviceFee: (decodeUnsignedNumber(serviceFee) / 100).toString() + '%',
        automaticActivation:
          decodeString(activationStatus) === 'true' ? 'ON' : 'OFF'
      };
    } catch (error) {
      console.error(error);
    }
  };

  const getNodesNumber = async (): Promise<Array<Buffer> | undefined> => {
    try {
      const query = new Query({
        address: new Address(network.auctionContract),
        func: new ContractFunction('getBlsKeysStatus'),
        args: [new AddressValue(new Address(network.delegationContract))]
      });

      const data = await provider.queryContract(query);
      const response = data.outputUntyped();

      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const getNodesData = async (): Promise<Array<Buffer> | undefined> => {
    try {
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getAllNodeStates')
      });

      const data = await provider.queryContract(query);
      const response = data.outputUntyped();

      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const getTotalActiveStake = async (): Promise<string | undefined> => {
    try {
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getTotalActiveStake')
      });

      const data = await provider.queryContract(query);
      const [totalNodes] = data.outputUntyped();

      return decodeBigNumber(totalNodes).toFixed();
    } catch (error) {
      console.error(error);
    }
  };

  const getUserActiveStake = async (): Promise<string | undefined> => {
    try {
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getUserActiveStake'),
        args: [new AddressValue(new Address(address))]
      });

      const data = await provider.queryContract(query);
      const [userStake] = data.outputUntyped();

      return denominate({
        input: decodeBigNumber(userStake).toFixed(),
        decimals,
        denomination,
        addCommas: false
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getUndelegatedStakeList = async (): Promise<
    Array<UndelegateStakeListType> | undefined
  > => {
    try {
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getUserUnDelegatedList'),
        args: [new AddressValue(new Address(account.address))]
      });

      const [data, config, status] = await Promise.all([
        provider.queryContract(query),
        provider.getNetworkConfig(),
        provider.getNetworkStatus()
      ]);

      const payload = data
        .outputUntyped()
        .reduce((total: any, item, index, array) => {
          if (index % 2 !== 0) {
            return total;
          } else {
            const next = array[index + 1];
            const getTime = (): number => {
              const epochsChangesRemaining = decodeUnsignedNumber(next);
              const roundsRemainingInEpoch =
                config.RoundsPerEpoch - status.RoundsPassedInCurrentEpoch;
              const roundEpochComplete =
                epochsChangesRemaining > 1
                  ? (epochsChangesRemaining - 1) * config.RoundsPerEpoch
                  : 0;

              return (
                ((roundsRemainingInEpoch + roundEpochComplete) *
                  config.RoundDuration) /
                1000
              );
            };

            const current = {
              timeLeft: decodeString(next) === '' ? 0 : getTime(),
              value: denominate({
                input: decodeBigNumber(item).toFixed(),
                decimals,
                denomination
              })
            };

            const exists = total.find(
              (withdrawal: UndelegateStakeListType) =>
                withdrawal.timeLeft === withdrawal.timeLeft
            );

            const value = exists
              ? (parseInt(exists.value) + parseInt(current.value)).toFixed()
              : 0;

            if (exists) {
              return [
                ...(total.length > 1 ? total : []),
                {
                  ...exists,
                  value
                }
              ];
            } else {
              return [...total, current];
            }
          }
        }, []);

      return payload.sort(
        (alpha: UndelegateStakeListType, beta: UndelegateStakeListType) =>
          alpha.timeLeft - beta.timeLeft
      );
    } catch (error) {
      console.error(error);
    }
  };

  const getUserClaimableRewards = async (): Promise<string | undefined> => {
    try {
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getClaimableRewards'),
        args: [new AddressValue(new Address(address))]
      });

      const data = await provider.queryContract(query);
      const [claimableRewards] = data.outputUntyped();

      return denominate({
        input: decodeBigNumber(claimableRewards).toFixed(),
        decimals: 4,
        denomination
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getNetworkConfig = async (): Promise<any> => {
    try {
      return await getNetworkProxy().getNetworkConfig();
    } catch (error) {
      console.error(error);
    }
  };

  const getTotalNetworkStake = async (): Promise<any> => {
    try {
      const query = new ApiProvider(network.apiAddress, {
        timeout: 4000
      });

      return await query.getNetworkStake();
    } catch (error) {
      console.error(error);
    }
  };

  const getAgencyMetaData = async (): Promise<
    AgencyMetaDataType | undefined
  > => {
    try {
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getMetaData')
      });

      const data = await provider.queryContract(query);
      const [name, website, keybase] = data.outputUntyped().map(decodeString);

      return {
        name,
        website,
        keybase
      };
    } catch (error) {
      console.error(error);
    }
  };

  return {
    getUsersNumber,
    getContractDetails,
    getNodesNumber,
    getNodesData,
    getTotalActiveStake,
    getUserActiveStake,
    getUndelegatedStakeList,
    getUserClaimableRewards,
    getNetworkConfig,
    getTotalNetworkStake,
    getAgencyMetaData
  };
};

export default useCallbacks;
