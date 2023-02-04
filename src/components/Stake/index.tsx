import React, { FC, ReactNode, MouseEvent } from 'react';
import { faLock, faGift } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { denominate } from '/src/helpers/denominate';

import XLogo from '/src/assets/XLogo';
import { network } from '/src/config';
import { useGlobalContext } from '/src/context';
import modifiable from '/src/helpers/modifiable';

import Delegate from './components/Delegate';
import Undelegate from './components/Undelegate';

import useStakeData from './hooks';

import * as styles from './styles.module.scss';

interface ActionType {
  label: string;
  render?: ReactNode;
  transaction?: (value: MouseEvent) => Promise<void>;
}

interface PanelType {
  subicon: ReactNode;
  color: string;
  title: string;
  value: string;
  disabled: boolean;
  actions: Array<ActionType>;
}

const Stake = () => {
  const { userActiveStake, userClaimableRewards } = useGlobalContext();
  const { onRedelegate, onClaimRewards } = useStakeData();
  const { isLoading, isEmpty, isError, nothingToClaim } = {
    isEmpty: userActiveStake.data === '0',
    isLoading: userActiveStake.status === 'loading',
    isError: userActiveStake.status === 'error',
    nothingToClaim: userClaimableRewards
      ? userClaimableRewards.data === '0'
      : true
  };

  const panels: Array<PanelType> = [
    {
      subicon: <FontAwesomeIcon icon={faLock} />,
      color: '#2044F5',
      title: 'Active Stake',
      value: denominate({
        input: userActiveStake.data || '0',
        decimals: 4,
        addCommas: false
      }),
      disabled: false,
      actions: [
        {
          render: <Undelegate />,
          label: 'Unstake'
        },
        {
          render: <Delegate />,
          label: 'Stake'
        }
      ]
    },
    {
      subicon: <FontAwesomeIcon icon={faGift} />,
      color: '#27C180',
      title: 'Rewards',
      value: `+ ${userClaimableRewards.data || '0'}`,
      disabled: nothingToClaim,
      actions: [
        {
          transaction: onClaimRewards,
          label: 'Claim Now'
        },
        {
          transaction: onRedelegate,
          label: 'Restake'
        }
      ]
    }
  ];

  return (
    <div
      className={`${modifiable(
        'stake',
        [(isLoading || isError || isEmpty) && 'empty'],
        styles
      )} stake`}
    >
      {isLoading || isError || isEmpty ? (
        <div className={styles.wrapper}>
          <strong className={styles.heading}>Stake EGLD</strong>

          <div className={styles.logo}>
            <XLogo />

            <div style={{ background: '#2044F5' }} className={styles.subicon}>
              <FontAwesomeIcon icon={faLock} />
            </div>
          </div>

          <div className={styles.message}>
            {isLoading
              ? 'Loading...'
              : isError
              ? 'There was an error trying to retrieve staking data.'
              : `Currently you don't have any ${network.egldLabel} staked.`}
          </div>

          <Delegate />
        </div>
      ) : (
        panels.map((panel, index) => (
          <div key={panel.title} className={styles.panel}>
            <div
              className={modifiable(
                'icon',
                [index > 0 && panel.disabled && 'inversed'],
                styles
              )}
            >
              <XLogo />

              {index > 0 &&
                !panel.disabled &&
                Array.from({ length: 4 }).map((item, iteratee) => (
                  <strong
                    key={`plus-${iteratee}`}
                    className={modifiable('plus', [iteratee + 1], styles)}
                  >
                    +
                  </strong>
                ))}

              {!panel.disabled && (
                <div
                  style={{ background: panel.color }}
                  className={styles.subicon}
                >
                  {panel.subicon}
                </div>
              )}
            </div>

            <div className={styles.title}>{panel.title}</div>

            <strong className={styles.value}>
              {panel.value} {network.egldLabel}
            </strong>

            <div className={styles.actions}>
              {panel.actions.map((action, iteratee) =>
                action.render ? (
                  <div key={action.label}>{action.render}</div>
                ) : (
                  <button
                    key={action.label}
                    type='button'
                    style={{ background: iteratee ? panel.color : '#303234' }}
                    className={modifiable(
                      'action',
                      [panel.disabled && 'disabled'],
                      styles
                    )}
                    onClick={action.transaction}
                  >
                    {action.label}
                  </button>
                )
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Stake;
