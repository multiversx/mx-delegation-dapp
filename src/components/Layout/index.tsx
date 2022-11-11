import React from 'react';
import { ReactNode } from 'react';

import { AuthenticatedRoutesWrapper } from '@elrondnetwork/dapp-core/wrappers';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core/hooks';
import * as DappUI from '@elrondnetwork/dapp-core/UI';

import { useLocation } from 'react-router-dom';
import routes, { routeNames } from '/src/routes';
import Navbar from './Navbar';

const Layout = ({ children }: { children: ReactNode }) => {
  const { search } = useLocation();
  const { address } = useGetAccountInfo();

  return (
    <div className='layout d-flex flex-column flex-fill wrapper'>
      {Boolean(address) && <Navbar />}

      <main className='d-flex flex-column flex-grow-1'>
        <AuthenticatedRoutesWrapper
          routes={routes}
          unlockRoute={`${routeNames.unlock}${search}`}
        >
          {children}
        </AuthenticatedRoutesWrapper>
      </main>
    </div>
  );
};

export default Layout;
