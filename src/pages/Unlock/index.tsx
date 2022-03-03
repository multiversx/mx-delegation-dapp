import React from 'react';
import { ReactNode, useEffect } from 'react';

import { useGetAccountInfo, DappUI } from '@elrondnetwork/dapp-core';
import { useNavigate } from 'react-router-dom';

import Extension from 'assets/Extension';
import Ledger from 'assets/Ledger';
import Logo from 'assets/Logo';
import Maiar from 'assets/Maiar';

import { network } from 'config';

import styles from './styles.module.scss';

interface ConnectionType {
  title: string;
  name: string;
  background: string;
  icon: ReactNode;
  component: any;
  hide?: boolean;
}

const Unlock: React.FC = () => {
  const { address } = useGetAccountInfo();

  const navigate = useNavigate();
  const connects: Array<ConnectionType> = [
    {
      title: 'Desktop',
      name: 'Elrond Web Wallet',
      background: '#000000',
      icon: <Logo />,
      component: DappUI.WebWalletLoginButton
    },
    {
      title: 'Hardware',
      name: 'Ledger',
      background: '#000000',
      icon: <Ledger />,
      component: DappUI.LedgerLoginButton
    },
    {
      title: 'Mobile',
      name: 'Maiar App',
      background: 'linear-gradient(225deg, #2C58DA 0%, #1A2ABA 100%)',
      icon: <Maiar />,
      component: DappUI.WalletConnectLoginButton
    },
    {
      title: 'Browser',
      name: 'Maiar DeFi Wallet',
      background: 'linear-gradient(225deg, #2C58DA 0%, #1A2ABA 100%)',
      icon: <Extension />,
      component: DappUI.ExtensionLoginButton,
      hide: !window.elrondWallet
    }
  ];

  const redirectConditionally = () => {
    if (Boolean(address)) {
      navigate('/dashboard');
    }
  };

  useEffect(redirectConditionally, [address]);

  return (
    <div className={styles.unlock}>
      <div className={styles.wrapper}>
        <div className={styles.logo}>
          <Logo />
        </div>

        <strong className={styles.heading}>RisaSoft Staking</strong>

        <div className={styles.description}>
          {`Help secure the Elrond blockchain and earn 12% - 16% APR on your eGLD when you stake us. All delegations are non-custodial so you remain in control of your digital assets. Running on our world class infrastructure ensures minimal downtime and maximum rewards.`}
        </div>

        <div className={styles.connects}>
          {connects.map((connect: ConnectionType) =>
            connect.hide ? null : (
              <connect.component
                key={connect.name}
                shouldRenderDefaultCss={false}
                callbackRoute='/dashboard'
                logoutRoute='/unlock'
              >
                <span className={styles.connect}>
                  <span className={styles.title}>{connect.title}</span>

                  <span
                    className={styles.icon}
                    style={{ background: connect.background }}
                  >
                    {connect.icon}
                  </span>

                  <span className={styles.name}>{connect.name}</span>
                </span>
              </connect.component>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Unlock;
