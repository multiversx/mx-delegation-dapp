import React from 'react';
import { DappProvider, DappUI } from '@elrondnetwork/dapp-core';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Layout from 'components/Layout';
import { network, walletConnectBridge, walletConnectDeepLink } from 'config';
import { ContextProvider } from 'context';
import PageNotFound from 'pages/PageNotFound';
import Unlock from 'pages/Unlock';
import { routeNames } from 'routes';
import routes from 'routes';
import '@elrondnetwork/dapp-core/build/index.css';

const App = () => (
  <Router>
    <DappProvider
      environment={network.id}
      customNetworkConfig={{
        ...network,
        walletConnectBridge,
        walletConnectDeepLink
      }}
      completedTransactionsDelay={500}
    >
      <ContextProvider>
        <Layout>
          <DappUI.TransactionsToastList />
          <DappUI.SignTransactionsModals />
          <DappUI.NotificationModal />
          <Routes>
            <Route path={routeNames.unlock} element={<Unlock />} />

            {routes.map((route: any, index: number) => (
              <Route
                path={route.path}
                key={'route-key-' + index}
                element={<route.component />}
              />
            ))}
            <Route element={PageNotFound} />
          </Routes>
        </Layout>
      </ContextProvider>
    </DappProvider>
  </Router>
);

export default App;
