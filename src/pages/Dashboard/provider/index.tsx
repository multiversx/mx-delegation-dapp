import * as React from 'react';

import { useContext, createContext, ReactChild } from 'react';

import useClient from './client';

interface DashboardProviderType {
  children: ReactChild | Array<ReactChild>;
}

const DashboardContext = createContext<any>({});
const DashboardProvider = ({ children }: DashboardProviderType) => (
  <DashboardContext.Provider value={useClient()}>
    {children}
  </DashboardContext.Provider>
);

const withDashboard = (Component: React.FC) => () =>
  (
    <DashboardProvider>
      <Component />
    </DashboardProvider>
  );

const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error(
      'You must call useDashboard() inside of a <DashboardProvider />, or a component wrapped in withDashboard().'
    );
  }

  return context;
};

export { DashboardProvider, withDashboard, useDashboard };
