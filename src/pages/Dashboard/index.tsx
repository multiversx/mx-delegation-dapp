import * as React from 'react';

import { withApp } from '../../provider';

import Cards from './components/Cards';
import Heading from './components/Heading';
import Nodes from './components/Nodes';
import Staking from './components/Staking';
import Withdrawals from './components/Withdrawals';

import { useDashboard, withDashboard } from './provider';

const Dashboard: React.FC = () => {
  const { adminEnabled } = useDashboard();

  return (
    <div className='container p-0'>
      <div className='mb-4'>
        <Heading />
      </div>

      <div className='mb-4'>
        <Cards />
      </div>

      {!adminEnabled && (
        <div className='mb-4'>
          <Staking />
        </div>
      )}

      {!adminEnabled && (
        <div className='mb-4'>
          <Withdrawals />
        </div>
      )}

      {adminEnabled && (
        <div className='mb-4'>
          <Nodes />
        </div>
      )}
    </div>
  );
};

export default withApp(withDashboard(Dashboard));
