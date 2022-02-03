import { useReducer, useEffect } from 'react';

import { getAddress, getEgldLabel } from '@elrondnetwork/dapp-core';
import { Address } from '@elrondnetwork/erdjs';

import { denomination, decimals } from 'config';
import useCallbacks from './callbacks';
import denominate from './helpers/denominate';
import initializer from './initializer';
import reducer from './reducer';

const useClient = () => {
  const [state, dispatch] = useReducer(reducer, initializer);
  const {
    getUsersNumber,
    getContractDetails,
    getNodesNumber,
    getTotalActiveStake,
    getUserActiveStake,
    getUndelegatedStakeList,
    getUserClaimableRewards
  } = useCallbacks();

  const denominated = (input: string, parameters?: any): string =>
    denominate({
      input,
      denomination,
      decimals,
      ...parameters
    });

  const getData = () => {
    const fetchData = async () => {
      const [
        egldLabel,
        usersNumber,
        contractDetails,
        nodesNumber,
        userAddress,
        totalActiveStake,
        userActiveStake,
        undelegatedStakeList,
        userClaimableRewards
      ] = await Promise.all([
        getEgldLabel(),
        getUsersNumber(),
        getContractDetails(),
        getNodesNumber(),
        getAddress(),
        getTotalActiveStake(),
        getUserActiveStake(),
        getUndelegatedStakeList(),
        getUserClaimableRewards()
      ]);

      dispatch({
        type: 'getEgldLabel',
        egldLabel
      });

      dispatch({
        type: 'getUsersNumber',
        usersNumber
      });

      dispatch({
        type: 'getContractDetails',
        contractDetails
      });

      dispatch({
        type: 'getNodesNumber',
        nodesNumber
      });

      dispatch({
        type: 'getContractOwnerStatus',
        contractOwnerStatus: contractDetails
          ? new Address(userAddress).hex() === contractDetails.ownerAddress
          : false
      });

      dispatch({
        type: 'getTotalActiveStake',
        totalActiveStake: `${denominated(totalActiveStake || '0')} ${egldLabel}`
      });

      dispatch({
        type: 'getUserActiveStake',
        userActiveStake
      });

      dispatch({
        type: 'getUndelegatedStakeList',
        undelegatedStakeList
      });

      dispatch({
        type: 'getUserClaimableRewards',
        userClaimableRewards
      });
    };

    fetchData();
  };

  useEffect(getData, []);

  return state;
};

export default useClient;
