import * as React from 'react';

import { useContext, createContext, ReactChild } from 'react';

import useClient from './client';

interface AppProviderType {
  children: ReactChild | Array<ReactChild>;
}

const AppContext = createContext<any>({});
const AppProvider = ({ children }: AppProviderType) => (
  <AppContext.Provider value={useClient()}>{children}</AppContext.Provider>
);

const withApp = (Component: React.FC) => () =>
  (
    <AppProvider>
      <Component />
    </AppProvider>
  );

const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'You must call useApp() inside of a <AppProvider />, or a component wrapped in withApp().'
    );
  }

  return context;
};

export { AppProvider, withApp, useApp };
