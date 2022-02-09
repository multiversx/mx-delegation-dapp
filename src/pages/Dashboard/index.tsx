import * as React from 'react';

import { useGlobalContext } from 'context';

import Cards from './components/Cards';
import Heading from './components/Heading';
import Nodes from './components/Nodes';
import Staking from './components/Staking';
import Withdrawals from './components/Withdrawals';

import useGlobalData from './hooks/useGlobalData';

const Dashboard: React.FC = () => {
  const { adminView } = useGlobalContext();

  useGlobalData();

  return (
    <div className='container p-0'>
      <div className='mb-4'>
        <Heading />
      </div>

      <div className='mb-4'>
        <Cards />
      </div>

      {!adminView && (
        <div className='mb-4'>
          <Staking />
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
