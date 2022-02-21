import * as React from 'react';
import {
  ReactNode,
  createContext,
  useState,
  useContext,
  ComponentType
} from 'react';

export interface StateType {
  showModal: boolean;
  setShowModal: (state: boolean) => void;
}

interface ContextType {
  children: ReactNode;
}

const Context = createContext<StateType | undefined>(undefined);
const ContextProvider = ({ children }: ContextType) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <Context.Provider value={{ showModal, setShowModal }}>
      {children}
    </Context.Provider>
  );
};

const useAction = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error(
      'The useAction hook must be used within a Context.Provider'
    );
  } else {
    return context;
  }
};

const withAction =
  (Component: ComponentType<ContextType & StateType>) => (props: any) =>
    (
      <ContextProvider>
        <Component {...props} />
      </ContextProvider>
    );

export { withAction, useAction };
