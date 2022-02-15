import React from 'react';
import { ReactNode, MouseEvent, useState, useEffect } from 'react';

import { loginServices, useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import Extension from 'assets/Extension';
import Ledger from 'assets/Ledger';
import Logo from 'assets/Logo';
import Maiar from 'assets/Maiar';

import { network } from 'config';
import modifiable from 'helpers/modifiable';

import styles from './styles.module.scss';

interface UnlockableType {
  title: string;
  name: string;
  background: string;
  icon: ReactNode;
  payload: any;
}

const Unlock: React.FC = () => {
  const navigate = useNavigate();

  const { address } = useGetAccountInfo();
  const [show, setShow] = useState<boolean>(false);

  const settings = {
    callbackRoute: '/dashboard'
  };

  const unlockables: Array<UnlockableType> = [
    {
      title: 'Desktop',
      name: 'Elrond Web Wallet',
      background: '#000000',
      icon: <Logo />,
      payload: loginServices.useWebWalletLogin(settings)
    },
    {
      title: 'Hardware',
      name: 'Ledger',
      background: '#000000',
      icon: <Ledger />,
      payload: loginServices.useLedgerLogin(settings)
    },
    {
      title: 'Mobile',
      name: 'Maiar App',
      background: 'linear-gradient(225deg, #2C58DA 0%, #1A2ABA 100%)',
      icon: <Maiar />,
      payload: loginServices.useWalletConnectLogin({
        ...settings,
        logoutRoute: '/unlock'
      })
    },
    {
      title: 'Browser',
      name: 'Maiar DeFi Wallet',
      background: 'linear-gradient(225deg, #2C58DA 0%, #1A2ABA 100%)',
      icon: <Extension />,
      payload: loginServices.useExtensionLogin(settings)
    }
  ];

  useEffect(() => {
    if (Boolean(address)) {
      navigate('/dashboard');
    }
  }, [address]);

  return (
    <div className={styles.unlock}>
      <div className={styles.wrapper}>
        <div className={styles.logo}>
          <Logo />
        </div>

        <strong className={styles.heading}>Elrond Delegation Manager</strong>

        <div className={styles.description}>
          {`Delegate Elrond (${network.egldLabel}) and earn up to 25% APY!`}
        </div>

        <div className={styles.unlockables}>
          {unlockables.map((unlockable) => {
            const [trigger, status, meta] = unlockable.payload;
            const onClick = (event: MouseEvent) => {
              trigger();

              if (unlockable.name === 'Maiar App' && !show) {
                setTimeout(() => {
                  setShow(true);
                  event.preventDefault();
                }, 50);
              }
            };

            return (
              <div
                key={unlockable.name}
                onClick={onClick}
                className={modifiable(
                  'unlockable',
                  [status.error !== '' && 'error'],
                  styles
                )}
              >
                <span className={styles.title}>{unlockable.title}</span>

                <div
                  className={styles.icon}
                  style={{ background: unlockable.background }}
                >
                  {unlockable.icon}
                </div>

                <span className={styles.name}>{unlockable.name}</span>

                {meta && meta.qrCodeSvg && (
                  <Modal
                    show={show}
                    onHide={() => setShow(false)}
                    animation={false}
                    centered={true}
                  >
                    <div className={styles.qr}>
                      <div
                        className={styles.close}
                        onClick={() => setShow(false)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </div>

                      <div
                        dangerouslySetInnerHTML={{ __html: meta.qrCodeSvg }}
                        className={styles.code}
                      />

                      <div className={styles.subheading}>
                        Scan the QR code with the Maiar App
                      </div>
                    </div>
                  </Modal>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Unlock;
