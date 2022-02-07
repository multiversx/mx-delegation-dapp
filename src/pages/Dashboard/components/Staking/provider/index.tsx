import { useContext, createContext, ReactChild } from 'react';
import * as React from 'react';

import useClient from './client';

interface StakingProviderType {
  children: ReactChild | Array<ReactChild>;
}

const StakingContext = createContext({
  unstakeable: {
    active: false,
    exceeds: false,
    available: ''
  }
});

const StakingProvider = ({ children }: StakingProviderType) => (
  <StakingContext.Provider value={useClient()}>
    {children}
  </StakingContext.Provider>
);

const withStaking = (Component: React.FC) => () =>
  (
    <StakingProvider>
      <Component />
    </StakingProvider>
  );

const useStaking = () => {
  const context = useContext(StakingContext);

  if (!context) {
    throw new Error(
      'You must call useStaking() inside of a <StakingProvider />, or a component wrapped in withStaking().'
    );
  }

  return context;
};

export { StakingProvider, withStaking, useStaking };
