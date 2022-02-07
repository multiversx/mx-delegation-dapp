import * as React from 'react';
import { useReducer } from 'reinspect';
import { ActionType, reducer } from './reducer';
import initialState, { StateType } from './state';

type DispatchType = (action: ActionType) => void;
interface ContextProviderType {
  children: React.ReactNode;
}

const Context = React.createContext<StateType | undefined>(undefined);
const Dispatch = React.createContext<DispatchType | undefined>(undefined);

function Provider({ children }: ContextProviderType) {
  const [prodState, prodDispatch] = React.useReducer(reducer, initialState());
  const [devState, devDispatch] = useReducer(
    reducer,
    initialState(),
    'dashboardContext'
  );

  const state = process.env.NODE_ENV === 'development' ? devState : prodState;
  const dispatch =
    process.env.NODE_ENV === 'development' ? devDispatch : prodDispatch;

  return (
    <Context.Provider value={state}>
      <Dispatch.Provider value={dispatch}>{children}</Dispatch.Provider>
    </Context.Provider>
  );
}

function useState() {
  const context = React.useContext(Context);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a Provider');
  }
  return context;
}

function useDispatch() {
  const context = React.useContext(Dispatch);
  if (context === undefined) {
    throw new Error('useGlobalDispatch must be used within a Provider');
  }
  return context;
}

export { Provider, useState, useDispatch };
