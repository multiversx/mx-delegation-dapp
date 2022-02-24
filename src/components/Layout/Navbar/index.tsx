import * as React from 'react';
import { ReactNode } from 'react';

import { logout, useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { faWallet, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import Logo from 'assets/Logo';
import { network } from 'config';
import { denominated } from 'helpers/denominate';

import modifiable from 'helpers/modifiable';
import styles from './styles.module.scss';

interface ButtonsType {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

const Navbar: React.FC = () => {
  const { address, account } = useGetAccountInfo();
  const buttons: Array<ButtonsType> = [
    {
      icon: <Logo />,
      label: `${denominated(account.balance)} ${network.egldLabel}`
    },
    {
      icon: <FontAwesomeIcon icon={faWallet} size='lg' />,
      label: address
    },
    {
      icon: <FontAwesomeIcon icon={faPowerOff} />,
      label: 'Disconnect',
      onClick: () => logout()
    }
  ];

  return (
    <nav className={styles.nav}>
      <Link to='/dashboard' className={styles.heading}>
        <span className={styles.logo}>
          <Logo />
        </span>

        <span className={styles.title}>Delegation Manager</span>
      </Link>

      <div className={styles.buttons}>
        {buttons.map((button) => (
          <div
            key={button.label}
            className={modifiable(
              'button',
              [button.onClick && 'clickable'],
              styles
            )}
            onClick={button.onClick}
          >
            <span className={styles.icon}>{button.icon}</span>
            {button.label}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
