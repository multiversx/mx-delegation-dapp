import * as React from 'react';

import { getEgldLabel } from '@elrondnetwork/dapp-core';

import Action from './components/Action';
import Rewards from './components/Rewards';

import { withStaking, useStaking } from './provider';

const Staking: React.FC = () => {
  const egldLabel = getEgldLabel();
  const { loading, userStake, rewards } = useStaking();

  return (
    <div className='card mt-spacer'>
      <div className='card-body p-spacer'>
        <div className='d-flex justify-content-between'>
          <div>My Stake</div>

          {userStake !== '0' && (
            <div className='d-flex'>
              <div className='mr-2'>
                <Action mode='delegate' />
              </div>
              <Action mode='undelegate' />
            </div>
          )}
        </div>

        <div className='d-flex flex-wrap align-items-center justify-content-center text-center w-100'>
          <div>
            {loading ? (
              'Loading...'
            ) : (
              <div>
                {userStake === '0' ? (
                  <div className='state m-auto p-spacer text-center'>
                    <p className='h4 mt-2 mb-1'>No Stake Yet</p>
                    <div className='mb-3'>Welcome to our platform!</div>

                    <Action mode='delegate' />
                  </div>
                ) : (
                  <div>
                    <p className='m-0'>Active Delegation</p>
                    <p className='h4'>
                      {userStake} {egldLabel}{' '}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-muted'>
                    {rewards} {egldLabel} Claimable Rewards
                  </p>

                  {parseFloat(rewards) > 0 && <Rewards />}
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
