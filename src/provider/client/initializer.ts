import { UndelegateStakeListType } from 'provider/client/callbacks';

interface InitializerType {
  nodesNumber: Array<Uint8Array>;
  nodesData: Array<Uint8Array>;
  redelegationCap: string;
  automaticActivation: string;
  delegationCap: string;
  serviceFee: string;
  usersNumber: string;
  contractOwnerStatus: boolean;
  contractDelegationCap: string;
  totalActiveStake: string;
  userActiveStake: string;
  userClaimableRewards: string;
  egldLabel: string;
  undelegatedStakeList: Array<UndelegateStakeListType>;
  networkConfig: any; // TODO: optional add minimal type
  totalNetworkStake: any;
  agencyMetaData: {
    name: string;
    website: string;
    keybase: string;
  };
}

// TODO: initalizer moves to initialState in context/state

const initializer: InitializerType = {
  nodesNumber: [],
  nodesData: [],
  redelegationCap: '',
  automaticActivation: '',
  delegationCap: '',
  serviceFee: '',
  usersNumber: '', // restore from sessionStorage
  contractOwnerStatus: false,
  contractDelegationCap: '',
  totalActiveStake: '',
  userActiveStake: '',
  userClaimableRewards: '0',
  egldLabel: '',
  undelegatedStakeList: [],
  networkConfig: {},
  totalNetworkStake: {},
  agencyMetaData: {
    name: '',
    website: '',
    keybase: ''
  }
};

export default initializer;
