import React, { FC, useEffect } from 'react';

import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import * as DappUI from '@multiversx/sdk-dapp/UI';
import { useNavigate } from 'react-router-dom';

import Extension from '../../assets/Extension';
import Ledger from '../../assets/Ledger';
import XPortal from '../../assets/XPortal';
import Logo from '../../assets/Logo';
import XLogo from '../../assets/XLogo';

import * as styles './styles.module.scss';

interface ConnectionType {
  title: string;
  name: string;
  background: string;
  icon: any;
  component: any;
}

const Unlock = () => {
  const { address } = useGetAccountInfo();

  const navigate = useNavigate();
  const connects: Array<ConnectionType> = [
    {
      title: 'Browser',
      name: 'MultiversX DeFi Wallet',
      background: '#000000',
      icon: XLogo,
      component: DappUI.ExtensionLoginButton
    },
    {
      title: 'Mobile',
      name: 'xPortal Mobile Wallet',
      background: '#000000',
      icon: XPortal,
      component: DappUI.WalletConnectLoginButton
    },
    {
      title: 'Desktop',
      name: 'MultiversX Web Wallet',
      background: '#000000',
      icon: XLogo,
      component: DappUI.WebWalletLoginButton
    },
    {
      title: 'Hardware',
      name: 'Ledger Hardware Wallet',
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
    <>
      <small
        className='domain-warning d-block text-center py-2 px-3 '
        role='alert'
        style={{
          backgroundColor: 'rgba(255, 170, 0, 0.2)',
          height: '2.125rem',
          textAlign: 'center',
          padding: '.5rem 1rem',
          color: 'white'
        }}
      >
        <svg
          aria-hidden='true'
          focusable='false'
          data-prefix='fas'
          data-icon='lock'
          className='svg-inline--fa fa-lock fa-1x text-success mr-1'
          style={{
            height: '1rem',
            verticalAlign: 'baseline',
            marginRight: '.5rem'
          }}
          role='img'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 448 512'
        >
          <path
            fill='currentColor'
            d='M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z'
          ></path>
        </svg>
        Double check URL:&nbsp;
        <strong>
          <span className='text-success ml-1'>https:// </span>risastaking.com
        </strong>
      </small>
      <div className={styles.unlock}>
        <div className={styles.wrapper}>
          <div className={styles.logo}>
            <Logo />
          </div>

          <strong className={styles.heading}>RisaSoft Staking</strong>

          <div className={styles.description}>
            Stake $EGLD and $RISA 🔥
            <br />
            <br />
            <br />
            <br />
            <ul style={{ textAlign: 'left' }}>
              <li style={{ paddingBottom: '1rem' }}>8-12% APR on your $EGLD</li>
              <li style={{ paddingBottom: '1rem' }}>
                Up to 150% APR on your $RISA
              </li>
              <li style={{ paddingBottom: '1rem' }}>
                Airdropped $RISA (exclusive to our pool)
              </li>
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
      </div>
    </>
  );
};

export default Unlock;
