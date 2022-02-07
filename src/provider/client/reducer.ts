const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'getEgldLabel': {
      return {
        ...state,
        egldLabel: action.egldLabel
      };
    }
    case 'getUsersNumber': {
      return {
        ...state,
        usersNumber: action.usersNumber
      };
    }
    case 'getContractDetails': {
      return {
        ...state,
        automaticActivation: action.contractDetails.automaticActivation,
        redelegationCap: action.contractDetails.redelegationCap,
        serviceFee: action.contractDetails.serviceFee,
        delegationCap: action.contractDetails.delegationCap
      };
    }
    case 'getNodesNumber': {
      return {
        ...state,
        nodesNumber: action.nodesNumber
      };
    }
    case 'getNodesData': {
      return {
        ...state,
        nodesData: action.nodesData
      };
    }
    case 'getContractOwnerStatus': {
      return {
        ...state,
        contractOwnerStatus: action.contractOwnerStatus
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
    case 'getTotalNetworkStake': {
      return {
        ...state,
        totalNetworkStake: action.totalNetworkStake
      };
    }
    case 'getLoadingDataStatus': {
      return {
        ...state,
        loadingDataStatus: action.loadingDataStatus
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

export default reducer;
