import { useGetAccountInfo } from '@elrondnetwork/dapp-core';
import {
  decodeUnsignedNumber,
  ContractFunction,
  ProxyProvider,
  AddressValue,
  Address,
  Query,
  decodeString,
  decodeBigNumber
} from '@elrondnetwork/erdjs';
import { network, decimals, denomination } from 'config';
import denominate from './helpers/denominate';

interface ContractDetailsType {
  ownerAddress: string;
  automaticActivation: string;
  redelegationCap: string;
  serviceFee: string;
  delegationCap: string;
}

const useCallbacks = () => {
  const { account, address } = useGetAccountInfo();

  const getUsersNumber = async (): Promise<string | undefined> => {
    try {
      const provider = new ProxyProvider(network.gatewayAddress);
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
      const provider = new ProxyProvider(network.gatewayAddress);
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

  const getNodesNumber = async (): Promise<string | undefined> => {
    try {
      const provider = new ProxyProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.auctionContract),
        func: new ContractFunction('getBlsKeysStatus'),
        args: [new AddressValue(new Address(network.delegationContract))]
      });

      const data = await provider.queryContract(query);

      return data
        .outputUntyped()
        .filter((key) => decodeString(key) === 'staked')
        .length.toString();
    } catch (error) {
      console.error(error);
    }
  };

  const getTotalActiveStake = async (): Promise<string | undefined> => {
    try {
      const provider = new ProxyProvider(network.gatewayAddress);
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
      const provider = new ProxyProvider(network.gatewayAddress);
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
        denomination
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getUndelegatedStakeList = async (): Promise<any> => {
    try {
      const provider = new ProxyProvider(network.gatewayAddress);
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
              (withdrawal: any) => withdrawal.timeLeft === withdrawal.timeLeft
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
        (alpha: any, beta: any) => alpha.timeLeft - beta.timeLeft
      );
    } catch (error) {
      console.error(error);
    }
  };

  const getUserClaimableRewards = async (): Promise<string | undefined> => {
    try {
      const provider = new ProxyProvider(network.gatewayAddress);
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

  return {
    getUsersNumber,
    getContractDetails,
    getNodesNumber,
    getTotalActiveStake,
    getUserActiveStake,
    getUndelegatedStakeList,
    getUserClaimableRewards
  };
};

export default useCallbacks;
