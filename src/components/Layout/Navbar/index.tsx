import React, { FC, ReactNode } from 'react';

import { faWallet, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account/useGetAccountInfo';
import { logout } from '@multiversx/sdk-dapp/utils/logout';
import { Link } from 'react-router-dom';

import EGLD from 'assets/EGLD';
import { MultiversX } from 'assets/MultiversX';

import { network } from 'config';
import { denominated } from 'helpers/denominate';

import modifiable from 'helpers/modifiable';
import styles from './styles.module.scss';

interface ButtonsType {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  copy?: boolean;
}

const Navbar: FC = () => {
  const { address, account } = useGetAccountInfo();
  const buttons: Array<ButtonsType> = [
    {
      icon: <MultiversX />,
      label: `${denominated(account.balance)} ${network.egldLabel}`
    },
    {
      icon: <FontAwesomeIcon icon={faWallet} size='lg' />,
      label: address,
      onClick: () => navigator.clipboard.writeText(address)
    },
    {
      icon: <FontAwesomeIcon icon={faPowerOff} />,
      label: 'Disconnect',
      onClick: () => logout(`${location.origin}/unlock`)
    }
  ];

  return (
    <nav className={`${styles.nav} delegation-nav`}>
      <Link to='/dashboard' className={styles.heading}>
        <span className={styles.logo}>
          <EGLD />
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
            <div className={styles.icon}>{button.icon}</div>
            <span>{button.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
