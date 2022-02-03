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
    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
};

export default reducer;
