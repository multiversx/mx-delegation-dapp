import React from 'react';
import { NotificationModal } from '@multiversx/sdk-dapp/UI/NotificationModal';
import { SignTransactionsModals } from '@multiversx/sdk-dapp/UI/SignTransactionsModals';
import { TransactionsToastList } from '@multiversx/sdk-dapp/UI/TransactionsToastList';
import { DappProvider } from '@multiversx/sdk-dapp/wrappers/DappProvider';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Layout from 'components/Layout';
import { network, walletConnectBridge, walletConnectDeepLink } from 'config';
import { ContextProvider } from 'context';
import PageNotFound from 'pages/PageNotFound';
import Unlock from 'pages/Unlock';
import { routeNames } from 'routes';
import routes from 'routes';

const App = () => (
  <Router>
    <DappProvider
      environment={network.id}
      customNetworkConfig={{
        ...network,
        walletConnectBridge,
        walletConnectDeepLink
      }}
    >
      <ContextProvider>
        <Layout>
          <TransactionsToastList />
          <SignTransactionsModals />
          <NotificationModal />
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
