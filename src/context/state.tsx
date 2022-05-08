type StatusType = 'idle' | 'loading' | 'loaded' | 'error';
type ErrorType = null | string;

export interface UndelegateStakeListType {
  value: string;
  timeLeft: number;
}

export interface StateType {
  nodesNumber: {
    status: StatusType;
    error: ErrorType;
    data: null | Array<Uint8Array>;
  };
  contractDetails: {
    status: StatusType;
    error: ErrorType;
    data: null | {
      [key: string]: any;
      owner: boolean;
      redelegationCap: string;
      automaticActivation: string;
      delegationCap: string;
      serviceFee: string;
    };
  };
  usersNumber: {
    status: StatusType;
    error: ErrorType;
    data: null | string;
  };
  totalActiveStake: {
    status: StatusType;
    error: ErrorType;
    data: null | string;
  };
  userActiveStake: {
    status: StatusType;
    error: ErrorType;
    data: null | string;
  };
  userClaimableRewards: {
    status: StatusType;
    error: ErrorType;
    data: null | string;
  };
  undelegatedStakeList: {
    status: StatusType;
    error: ErrorType;
    data: null | Array<UndelegateStakeListType>;
  };
  totalNetworkStake: {
    status: StatusType;
    error: ErrorType;
    data: any;
  };
  networkConfig: {
    status: StatusType;
    error: ErrorType;
    data: any;
  };
  networkStatus: {
    status: StatusType;
    error: ErrorType;
    data: any;
  };
  agencyMetaData: {
    status: StatusType;
    error: ErrorType;
    data: null | {
      name: string;
      website: string;
      keybase: string;
    };
  };
}

export const initializer: StateType = {
  nodesNumber: {
    status: 'idle',
    data: null,
    error: null
  },
  contractDetails: {
    status: 'idle',
    data: null,
    error: null
  },
  usersNumber: {
    status: 'idle',
    data: null,
    error: null
  },
  totalActiveStake: {
    status: 'idle',
    data: null,
    error: null
  },
  userActiveStake: {
    status: 'idle',
    data: null,
    error: null
  },
  userClaimableRewards: {
    status: 'idle',
    data: null,
    error: null
  },
  undelegatedStakeList: {
    status: 'idle',
    data: null,
    error: null
  },
  totalNetworkStake: {
    status: 'idle',
    data: null,
    error: null
  },
  agencyMetaData: {
    status: 'idle',
    data: null,
    error: null
  },
  networkConfig: {
    status: 'idle',
    data: null,
    error: null
  },
  networkStatus: {
    status: 'idle',
    data: null,
    error: null
  }
};
