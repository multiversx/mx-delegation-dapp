import React from 'react';

import { useGlobalContext } from 'context';

import Cards from './components/Cards';
import Heading from './components/Heading';
import Nodes from './components/Nodes';
import Stake from './components/Stake';
import Toggles from './components/Toggles';
import Withdrawals from './components/Withdrawals';

import useGlobalData from './hooks/useGlobalData';

import styles from './styles.module.scss';

const Dashboard: React.FC = () => {
  const { adminView } = useGlobalContext();

  useGlobalData();

  return (
    <div className={styles.dashboard}>
      <div className='mb-4'>
        <Heading />
      </div>

      <div className='mb-4'>
        <Cards />
      </div>

      {adminView && (
        <div className='mb-4'>
          <Toggles />
        </div>
      )}

      {!adminView && (
        <div className='mb-4'>
          <Stake />
        </div>
      )}

      {!adminView && (
        <div className='mb-4'>
          <Withdrawals />
        </div>
      )}

      {adminView && (
        <div className='mb-4'>
          <Nodes />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
