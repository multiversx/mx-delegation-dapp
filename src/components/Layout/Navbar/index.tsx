import React, { FC, ReactNode } from 'react';

import { logout, useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { faWallet, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import EGLD from 'assets/EGLD';
import Logo from 'assets/Logo';

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
      icon: <Logo />,
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

        <span className={styles.title}>RisaSoft Staking</span>
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
