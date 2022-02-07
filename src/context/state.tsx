export interface StateType {
  isAdmin?: boolean;

  // nodesCount: number;
  // nodesCountState: 'idle' | 'fetching' | 'fetched' | 'error';
}

const initialState = (): StateType => {
  return {
    isAdmin: undefined
  };
};

export default initialState;
