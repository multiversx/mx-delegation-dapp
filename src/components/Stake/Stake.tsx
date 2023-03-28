import React, { ReactNode, MouseEvent } from 'react';
import { faLock, faGift } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetActiveTransactionsStatus } from '@multiversx/sdk-dapp/hooks/transactions/useGetActiveTransactionsStatus';
import classNames from 'classnames';

import { MultiversX } from 'assets/MultiversX';
import { network } from 'config';
import { useGlobalContext } from 'context';
import { denominated } from 'helpers/denominate';

import { Delegate } from './components/Delegate';
import { Undelegate } from './components/Undelegate';

import useStakeData from './hooks';

import styles from './styles.module.scss';

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

export const Stake = () => {
  const { pending } = useGetActiveTransactionsStatus();
  const { userActiveStake, userClaimableRewards } = useGlobalContext();
  const { onRedelegate, onClaimRewards } = useStakeData();
  const { isLoading, isEmpty, isError } = {
    isEmpty: userActiveStake.data === '0' && userClaimableRewards.data === '0',
    isLoading:
      userActiveStake.status === 'loading' ||
      userClaimableRewards.status === 'loading',
    isError:
      userActiveStake.status === 'error' ||
      userClaimableRewards.status === 'error'
  };

  const panels: Array<PanelType> = [
    {
      subicon: <FontAwesomeIcon icon={faLock} />,
      color: '#2044F5',
      title: 'Active Delegation',
      value: denominated(userActiveStake.data || '...', { addCommas: false }),
      disabled: false,
      actions: [
        {
          render: <Undelegate />,
          label: 'Undelegate'
        },
        {
          render: <Delegate />,
          label: 'Delegate'
        }
      ]
    },
    {
      subicon: <FontAwesomeIcon icon={faGift} />,
      color: '#27C180',
      title: 'Claimable Rewards',
      value: `+ ${userClaimableRewards.data || '...'}`,
      disabled: !userClaimableRewards.data || userClaimableRewards.data === '0',
      actions: [
        {
          transaction: onClaimRewards,
          label: 'Claim Now'
        },
        {
          transaction: onRedelegate,
          label: 'Redelegate'
        }
      ]
    }
  ];

  return (
    <div
      className={classNames(
        styles.stake,
        { [styles.empty]: isLoading || isError || isEmpty },
        'stake'
      )}
    >
      {isLoading || isError || isEmpty ? (
        <div className={styles.wrapper}>
          <strong className={styles.heading}>
            Welcome to Delegation Dashboard!
          </strong>

          <div className={styles.logo}>
            <MultiversX />

            <div style={{ background: '#2044F5' }} className={styles.subicon}>
              <FontAwesomeIcon icon={faLock} />
            </div>
          </div>

          <div className={styles.message}>
            {isLoading
              ? 'Retrieving staking data...'
              : isError
              ? 'There was an error trying to retrieve staking data.'
              : `Currently you don't have any ${network.egldLabel} staked.`}
          </div>

          <Delegate />
        </div>
      ) : (
        panels.map((panel, index) => (
          <div key={panel.title} className={styles.panel}>
            <div className={styles.icon}>
              <MultiversX />

              {index > 0 &&
                Array.from({ length: 4 }).map((item, iteratee) => (
                  <strong
                    key={`plus-${iteratee}`}
                    className={classNames(
                      styles.plus,
                      styles[`plus-${iteratee + 1}`]
                    )}
                  >
                    +
                  </strong>
                ))}

              <div
                style={{ background: panel.color }}
                className={styles.subicon}
              >
                {panel.subicon}
              </div>
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
                    onClick={action.transaction}
                    className={classNames(styles.action, {
                      [styles.disabled]: panel.disabled || pending
                    })}
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
