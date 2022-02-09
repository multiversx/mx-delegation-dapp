import * as React from 'react';
import { useEffect } from 'react';

import { useGetAccountInfo } from '@elrondnetwork/dapp-core';
import {
  Query,
  Address,
  AddressValue,
  ContractFunction,
  ProxyProvider,
  decodeBigNumber
} from '@elrondnetwork/erdjs';

import { network, denomination } from 'config';
import { useDispatch, useGlobalContext } from 'context';
import denominate from 'helpers/denominate';

import Action from 'pages/Dashboard/components/Action';
import Delegate from 'pages/Dashboard/components/Staking/components/Delegate';
import Rewards from 'pages/Dashboard/components/Staking/components/Rewards';
import Undelegate from 'pages/Dashboard/components/Staking/components/Undelegate';

import { withStaking } from './provider';

const Staking: React.FC = () => {
  const dispatch = useDispatch();

  const { userClaimableRewards, userActiveStake } = useGlobalContext();
  const { address } = useGetAccountInfo();

  const getUserClaimableRewards = async (): Promise<void> => {
    dispatch({
      type: 'getUserClaimableRewards',
      userClaimableRewards: {
        status: 'loading',
        data: null,
        error: null
      }
    });

    try {
      const provider = new ProxyProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getClaimableRewards'),
        args: [new AddressValue(new Address(address))]
      });

      const data = await provider.queryContract(query);
      const [claimableRewards] = data.outputUntyped();

      dispatch({
        type: 'getUserClaimableRewards',
        userClaimableRewards: {
          status: 'loaded',
          error: null,
          data: denominate({
            input: decodeBigNumber(claimableRewards).toFixed(),
            decimals: 4,
            denomination
          })
        }
      });
    } catch (error) {
      dispatch({
        type: 'getUserClaimableRewards',
        userClaimableRewards: {
          status: 'error',
          data: null,
          error
        }
      });
    }
  };

  useEffect(() => {
    if (!userClaimableRewards.data) {
      getUserClaimableRewards();
    }
  }, [userClaimableRewards.data]);

  return (
    <div className='card mt-spacer'>
      <div className='card-body p-spacer'>
        <div className='d-flex justify-content-between'>
          <div>My Stake</div>

          {userActiveStake.data !== '0' && (
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
            {userActiveStake.data === '0' ? (
              'Loading...'
            ) : (
              <div>
                {userActiveStake.data === '0' ? (
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
                      {userActiveStake.status === 'loading'
                        ? `... ${network.egldLabel}`
                        : userActiveStake.error
                        ? 'Active Delegation Unavailable'
                        : `${userActiveStake.data} ${network.egldLabel}`}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-muted'>
                    {userClaimableRewards.data} {network.egldLabel} Claimable
                    Rewards
                  </p>

                  {parseFloat(userClaimableRewards.data || '') > 0 && (
                    <Rewards />
                  )}
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
