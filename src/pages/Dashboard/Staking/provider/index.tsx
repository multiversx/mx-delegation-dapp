import { useContext, createContext } from 'react';

import useClient from './client';

import * as React from 'react';

/**
 * Create the context object.
 *
 * @see https://reactjs.org/docs/context.html#reactcreatecontext
 */

const StakingContext = createContext({
  loading: true,
  rewards: '0',
  userStake: '0',
  unstakeable: {
    active: false,
    exceeds: false,
    available: ''
  }
});

/**
 * Create context the provider.
 *
 * @see https://reactjs.org/docs/context.html#contextprovider
 */

const StakingProvider = ({ children }: { children: any }) => (
  <StakingContext.Provider value={useClient()}>
    {children}
  </StakingContext.Provider>
);

/**
 * Create the higher order provider wrapper.
 *
 * @see https://reactjs.org/docs/higher-order-components.html
 */

const withStaking = (Component: any) => () =>
  (
    <StakingProvider>
      <Component />
    </StakingProvider>
  );

/**
 * Create the custom provider hook.
 *
 * @see https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook
 */

const useStaking = () => {
  const context = useContext(StakingContext);

  if (!context) {
    throw new Error(
      'You must call useStaking() inside of a <StakingProvider />, or a component wrapped in withStaking().'
    );
  }

  return context;
};

/**
 * Export the components.
 */

export { StakingProvider, withStaking, useStaking };
