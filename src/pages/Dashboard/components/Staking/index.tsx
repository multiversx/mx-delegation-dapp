import * as React from 'react';

import { getEgldLabel } from '@elrondnetwork/dapp-core';

import { useApp } from 'provider';
import Action from '../Action';
import Delegate from './components/Delegate';
import Rewards from './components/Rewards';
import Undelegate from './components/Undelegate';

import { withStaking } from './provider';

const Staking: React.FC = () => {
  const egldLabel = getEgldLabel();
  const { userClaimableRewards, userActiveStake } = useApp();

  return (
    <div className='card mt-spacer'>
      <div className='card-body p-spacer'>
        <div className='d-flex justify-content-between'>
          <div>My Stake</div>

          {userActiveStake !== '0' && (
            <div className='d-flex'>
              <div className='mr-2'>
                <Action
                  trigger='Delegate'
                  title='Delegate Now'
                  description='Select the amount you want to delegate.'
                  render={<Delegate />}
                />
              </div>

              <Action
                trigger='Undelegate'
                title='Undelegate Now'
                description='Select the amount you want to undelegate.'
                render={<Undelegate />}
              />
            </div>
          )}
        </div>

        <div className='d-flex flex-wrap align-items-center justify-content-center text-center w-100'>
          <div>
            {userActiveStake === '0' ? (
              'Loading...'
            ) : (
              <div>
                {userActiveStake === '0' ? (
                  <div className='state m-auto p-spacer text-center'>
                    <p className='h4 mt-2 mb-1'>No Stake Yet</p>
                    <div className='mb-3'>Welcome to our platform!</div>

                    <Action
                      trigger='Delegate'
                      title='Delegate Now'
                      description='Select the amount you want to delegate.'
                      render={<Delegate />}
                    />
                  </div>
                ) : (
                  <div>
                    <p className='m-0'>Active Delegation</p>
                    <p className='h4'>
                      {userActiveStake} {egldLabel}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-muted'>
                    {userClaimableRewards} {egldLabel} Claimable Rewards
                  </p>

                  {parseFloat(userClaimableRewards) > 0 && <Rewards />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withStaking(Staking);
