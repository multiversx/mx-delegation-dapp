import { useEffect, useState } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account/useGetAccountInfo';
import { useNavigate } from 'react-router-dom';

import { Cards } from 'components/Cards';
import { Heading } from 'components/Heading';
import { Stake } from 'components/Stake';
import { Withdrawals } from 'components/Withdrawals';

import styles from './styles.module.scss';
import useGlobalData from '../../hooks/useGlobalData';

export const Dashboard = () => {
  const { address } = useGetAccountInfo();
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const handleRedirect = () =>
    address ? setLoading(false) : navigate('/unlock');

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
