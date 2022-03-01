import React, { useEffect, useState } from 'react';

import { useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';

import Cards from 'components/Cards';
import Heading from 'components/Heading';
import Stake from 'components/Stake';
import Withdrawals from 'components/Withdrawals';

import useGlobalData from '../../hooks/useGlobalData';

import styles from './styles.module.scss';

const Dashboard: React.FC = () => {
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

      <Withdrawals />
    </div>
  );
};

export default Dashboard;
