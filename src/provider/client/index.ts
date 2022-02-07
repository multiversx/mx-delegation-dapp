import { useReducer, useEffect } from 'react';

import { getAddress, getEgldLabel } from '@elrondnetwork/dapp-core';
import { Address } from '@elrondnetwork/erdjs';

import useCallbacks from './callbacks';
import initializer from './initializer';
import reducer from './reducer';

// TODO
// services/hooks
// helpers/hooks
// handle loading and error states

const useClient = () => {
  const [state, dispatch] = useReducer(reducer, initializer);

  const egldLabel = getEgldLabel();
  const {
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
  } = useCallbacks();

  // TODO: some hooks move at component level (maybe useEffect)

  const getData = () => {
    const fetchData = async () => {
      const [
        usersNumber,
        contractDetails,
        nodesNumber,
        nodesData,
        userAddress,
        totalActiveStake,
        userActiveStake,
        undelegatedStakeList,
        userClaimableRewards,
        networkConfig,
        totalNetworkStake,
        agencyMetaData
      ] = await Promise.all([
        getUsersNumber(),
        getContractDetails(),
        getNodesNumber(),
        getNodesData(),
        getAddress(),
        getTotalActiveStake(),
        getUserActiveStake(),
        getUndelegatedStakeList(),
        getUserClaimableRewards(),
        getNetworkConfig(),
        getTotalNetworkStake(),
        getAgencyMetaData()
      ]);

      dispatch({
        // TODO: remove
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
        type: 'getNodesData',
        nodesData
      });

      dispatch({
        type: 'getContractOwnerStatus',
        contractOwnerStatus: contractDetails
          ? new Address(userAddress).hex() === contractDetails.ownerAddress
          : false
      });

      dispatch({
        type: 'getTotalActiveStake',
        totalActiveStake
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

      dispatch({
        type: 'getNetworkConfig',
        networkConfig
      });

      dispatch({
        type: 'getTotalNetworkStake',
        totalNetworkStake
      });

      dispatch({
        type: 'getAgencyMetaData',
        agencyMetaData
      });
    };

    fetchData();
  };

  useEffect(getData, []);

  return state;
};

export default useClient;
