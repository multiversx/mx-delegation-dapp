import React, { FC, useEffect } from 'react';

import { useGetAccountInfo, DappUI } from '@elrondnetwork/dapp-core';
import { useNavigate } from 'react-router-dom';

import Extension from '../../assets/Extension';
import Ledger from '../../assets/Ledger';
import Maiar from '../../assets/Maiar';
import ElrondLogo from '../../assets/ElrondLogo';

import styles from './styles.module.scss';

interface ConnectionType {
  title: string;
  name: string;
  background: string;
  icon: any;
  component: any;
}

const Unlock: FC = () => {
  const { address } = useGetAccountInfo();

  const navigate = useNavigate();
  const connects: Array<ConnectionType> = [

    {
      title: 'Browser',
      name: 'Maiar DeFi Wallet',
      background: 'linear-gradient(225deg, #2C58DA 0%, #1A2ABA 100%)',
      icon: Extension,
      component: DappUI.ExtensionLoginButton
    },
    {
      title: 'Mobile',
      name: 'Maiar App',
      background: 'linear-gradient(225deg, #2C58DA 0%, #1A2ABA 100%)',
      icon: Maiar,
      component: DappUI.WalletConnectLoginButton
    },
    {
      title: 'Desktop',
      name: 'Elrond Web Wallet',
      background: '#000000',
      icon: ElrondLogo,
      component: DappUI.WebWalletLoginButton
    },
    {
      title: 'Hardware',
      name: 'Ledger',
      background: '#000000',
      icon: Ledger,
      component: DappUI.LedgerLoginButton
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
          🔥 Metabonding Special 🔥<br /><br />

          Staking $EGLD with us counts for Metabonding!🔥<br /><br />

          <br /><br />

          <ul style={{ textAlign: 'left' }} >
            <li style={{ paddingBottom: '1rem' }}>11-13% APR on your $EGLD</li>
            <li style={{ paddingBottom: '1rem' }}>Metabonding tokens ( $AERO, $EFFORT, $ZPAY, or $ISET)</li>
            <li style={{ paddingBottom: '1rem' }}>Airdropped $RISA (exclusive to our pool)</li>
          </ul>
          Login below to start staking:
        </div>
        <div className={styles.connects}>
          {connects.map((connect: ConnectionType) => (
            <connect.component
              key={connect.name}
              callbackRoute='/dashboard'
              logoutRoute='/unlock'
            >
              <span className={styles.connect}>
                <span className={styles.title}>{connect.title}</span>

                <span
                  className={styles.icon}
                  style={{ background: connect.background }}
                >
                  <connect.icon />
                </span>

                <span className={styles.name}>{connect.name}</span>
              </span>
            </connect.component>
          ))}
        </div>
      </div>
    </div >
  );
};

export default Unlock;
