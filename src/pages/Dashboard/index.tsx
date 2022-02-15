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
      <Heading />

      <Cards />

      {adminView && <Toggles />}

      {!adminView && <Stake />}

      {!adminView && <Withdrawals />}

      {adminView && <Nodes />}
    </div>
  );
};

export default Dashboard;
