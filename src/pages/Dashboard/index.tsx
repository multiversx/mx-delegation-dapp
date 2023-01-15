import React, { FC, useEffect, useState } from 'react';

import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';

import Cards from '/src/components/Cards';
import Heading from '/src/components/Heading';
import Stake from '/src/components/Stake';
import StakeRisa from '/src/components/StakeRisa';
import Withdrawals from '/src/components/Withdrawals';

import useGlobalData from '../../hooks/useGlobalData';

import styles from './styles.module.scss';

const Dashboard: FC = () => {
  const { address } = useGetAccountInfo();
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const handleRedirect = () =>
    Boolean(address) ? setLoading(false) : navigate('/unlock');

  useEffect(handleRedirect, [address]);
  useGlobalData();

  if (loading) {
    return (
      <div
        style={{ fontSize: '30px' }}
        className='d-flex align-items-center justify-content-center text-white flex-fill'
      >
        <FontAwesomeIcon
          icon={faSpinner}
          size='2x'
          spin={true}
          className='mr-3'
        />
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Heading />

      <Cards />

      <Stake />

      <StakeRisa />

      <Withdrawals />
    </div>
  );
};

export default Dashboard;
