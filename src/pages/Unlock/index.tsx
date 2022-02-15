import React from 'react';
import { ReactNode, useState, useEffect } from 'react';

import { loginServices, useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import QRCode from 'qrcode';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import Extension from 'assets/Extension';
import Ledger from 'assets/Ledger';
import Logo from 'assets/Logo';
import Maiar from 'assets/Maiar';

import { network } from 'config';
import modifiable from 'helpers/modifiable';

import styles from './styles.module.scss';

interface ConnectionType {
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
  const [qrCode, setQrCode] = useState<string>('');

  const settings = {
    callbackRoute: '/dashboard'
  };

  const connects: Array<ConnectionType> = [
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

  const redirectConditionally = () => {
    if (Boolean(address)) {
      navigate('/dashboard');
    }
  };

  const getQrCodde = () => {
    const fetchCode = async () => {
      const find = (connect: ConnectionType) => connect.name === 'Maiar App';
      const maiar = connects.find(find);
      const [meta] = maiar ? maiar.payload.reverse() : [];

      if (meta && meta.walletConnectUri) {
        setQrCode(
          await QRCode.toString(meta.walletConnectUri, {
            type: 'svg'
          })
        );
      }
    };

    if (!Boolean(qrCode)) {
      fetchCode();
    }
  };

  useEffect(redirectConditionally, [address]);
  useEffect(getQrCodde, [connects, qrCode]);

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

        <div className={styles.connects}>
          {connects.map((connect) => {
            const [trigger, status] = connect.payload;
            const onClick = () => {
              trigger();

              if (connect.name === 'Maiar App' && !show) {
                setTimeout(() => {
                  setShow(true);
                }, 50);
              }
            };

            return (
              <div
                key={connect.name}
                onClick={onClick}
                className={modifiable(
                  'connect',
                  [status.error !== '' && 'error'],
                  styles
                )}
              >
                <span className={styles.title}>{connect.title}</span>

                <div
                  className={styles.icon}
                  style={{ background: connect.background }}
                >
                  {connect.icon}
                </div>

                <span className={styles.name}>{connect.name}</span>

                {show && Boolean(qrCode) && (
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
                        dangerouslySetInnerHTML={{ __html: qrCode }}
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
