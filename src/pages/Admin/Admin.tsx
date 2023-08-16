import { useEffect, useState } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account/useGetAccountInfo';
import { useNavigate } from 'react-router-dom';

import { Cards } from 'components/Cards';
import { Heading } from 'components/Heading';
import { Nodes } from 'components/Nodes';
import { Toggles } from 'components/Toggles';

import { useGlobalContext } from 'context';

import styles from './styles.module.scss';
import useGlobalData from '../../hooks/useGlobalData';

export const Admin = () => {
  const { address } = useGetAccountInfo();
  const { contractDetails } = useGlobalContext();
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const handleRedirect = () => {
    if (!address) {
      navigate('/unlock');
      return;
    }

    if (contractDetails.status === 'loaded') {
      if (contractDetails.data && contractDetails.data.owner) {
        setLoading(false);
      } else {
        navigate('/dashboard');
      }
    }
  };

  useEffect(handleRedirect, [address, contractDetails.data]);
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
    <div className={styles.admin}>
      <Heading />
      <Cards />
      <Toggles />
      <Nodes />
    </div>
  );
};
