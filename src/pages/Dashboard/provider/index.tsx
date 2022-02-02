import { useContext, createContext } from 'react';

import * as React from 'react';
import { decimals, denomination } from 'config';
import denominate from 'pages/Dashboard/helpers/denominate';

import useClient from './client';

// TODO: remvoe comments
// TODO: global context
/**
 * Create the context object.
 *
 * @see https://reactjs.org/docs/context.html#reactcreatecontext
 */

const DashboardContext = createContext<any>({});

/**
 * Create context the provider.
 *
 * @see https://reactjs.org/docs/context.html#contextprovider
 */

const DashboardProvider = ({ children }: { children: any }) => (
  <DashboardContext.Provider value={useClient()}>
    {children}
  </DashboardContext.Provider>
);

/**
 * Create the higher order provider wrapper.
 *
 * @see https://reactjs.org/docs/higher-order-components.html
 */

const withDashboard = (Component: any) => () =>
  (
    <DashboardProvider>
      <Component />
    </DashboardProvider>
  );

/**
 * Create the custom provider hook.
 *
 * @see https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook
 */

const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error(
      'You must call useDashboard() inside of a <DashboardProvider />, or a component wrapped in withDashboard().'
    );
  }

  return context;
};

/**
 * Export the components.
 */

export { DashboardProvider, withDashboard, useDashboard };
