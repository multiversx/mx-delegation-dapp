import { StateType } from './state';

export type DispatchType = (action: any) => void;
export type ActionType =
  | {
      type: 'getUsersNumber';
      usersNumber: StateType['usersNumber'];
    }
  | {
      type: 'getContractDetails';
      contractDetails: StateType['contractDetails'];
    }
  | {
      type: 'getNodesNumber';
      nodesNumber: StateType['nodesNumber'];
    }
  | {
      type: 'getTotalActiveStake';
      totalActiveStake: StateType['totalActiveStake'];
    }
  | {
      type: 'getUserActiveStake';
      userActiveStake: StateType['userActiveStake'];
    }
  | {
      type: 'getUndelegatedStakeList';
      undelegatedStakeList: StateType['undelegatedStakeList'];
    }
  | {
      type: 'getUserClaimableRewards';
      userClaimableRewards: StateType['userClaimableRewards'];
    }
  | {
      type: 'getNetworkConfig';
      networkConfig: StateType['networkConfig'];
    }
  | {
      type: 'getNetworkStatus';
      networkStatus: StateType['networkStatus'];
    }
  | {
      type: 'getTotalNetworkStake';
      totalNetworkStake: StateType['totalNetworkStake'];
    }
  | {
      type: 'getAgencyMetaData';
      agencyMetaData: StateType['agencyMetaData'];
    };

const reducer = (state: StateType, action: any) => {
  switch (action.type) {
    case 'getUsersNumber': {
      return {
        ...state,
        usersNumber: action.usersNumber
      };
    }
    case 'getContractDetails': {
      return {
        ...state,
        contractDetails: action.contractDetails
      };
    }
    case 'getNodesNumber': {
      return {
        ...state,
        nodesNumber: action.nodesNumber
      };
    }
    case 'getTotalActiveStake': {
      return {
        ...state,
        totalActiveStake: action.totalActiveStake
      };
    }
    case 'getUserActiveStake': {
      return {
        ...state,
        userActiveStake: action.userActiveStake
      };
    }
    case 'getUndelegatedStakeList': {
      return {
        ...state,
        undelegatedStakeList: action.undelegatedStakeList
      };
    }
    case 'getUserClaimableRewards': {
      return {
        ...state,
        userClaimableRewards: action.userClaimableRewards
      };
    }
    case 'getNetworkConfig': {
      return {
        ...state,
        networkConfig: action.networkConfig
      };
    }
    case 'getNetworkStatus': {
      return {
        ...state,
        networkStatus: action.networkStatus
      };
    }
    case 'getTotalNetworkStake': {
      return {
        ...state,
        totalNetworkStake: action.totalNetworkStake
      };
    }
    case 'getAgencyMetaData': {
      return {
        ...state,
        agencyMetaData: action.agencyMetaData
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
};

export { reducer };
