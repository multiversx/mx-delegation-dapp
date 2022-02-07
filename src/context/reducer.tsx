import { StateType } from './state';

export type ActionType = {
  type: 'setIsAdmin';
  isAdmin: StateType['isAdmin'];
};

export function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'setIsAdmin': {
      return { ...state, isAdmin: action.isAdmin };
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}
