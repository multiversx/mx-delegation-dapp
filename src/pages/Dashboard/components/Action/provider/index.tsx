import * as React from 'react';

import { useContext, createContext, ReactChild } from 'react';

import useClient from './client';

interface ActionProviderType {
  children: ReactChild | Array<ReactChild>;
}

// TODO: move to context

const ActionContext = createContext<any>({});
const ActionProvider = ({ children }: ActionProviderType) => (
  <ActionContext.Provider value={useClient()}>
    {children}
  </ActionContext.Provider>
);

const withAction = (Component: React.FC) => (props: any) =>
  (
    <ActionProvider>
      <Component {...props} />
    </ActionProvider>
  );

const useAction = () => {
  const context = useContext(ActionContext);

  if (!context) {
    throw new Error(
      'You must call useAction() inside of a <ActionProvider />, or a component wrapped in withAction().'
    );
  }

  return context;
};

export { ActionProvider, withAction, useAction };
