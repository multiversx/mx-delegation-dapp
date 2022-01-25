import * as React from 'react';

import Meta from './Meta';
import Card from './Card';
import Staking from './Staking';
import Withdrawals from './Withdrawals';

import useContractStake from './hooks/useContractStake';
import useUserNumber from './hooks/useUserNumber';
import useNodeNumber from './hooks/useNodeNumber';
import useServiceFee from './hooks/useServiceFee';
import useDelegationCap from './hooks/useDelegationCap';
import { withDashboard } from './provider';

interface CardsType {
  label: string;
  data: {
    value: string;
    percentage?: string;
  };
}

const Dashboard: React.FC = () => {
  const cards: Array<CardsType> = [
    {
      data: useContractStake(),
      label: 'Contract Stake'
    },
    {
      data: useUserNumber(),
      label: 'Number of Users'
    },
    {
      data: useNodeNumber(),
      label: 'Number of Nodes'
    },
    {
      data: useServiceFee(),
      label: 'Service Fee'
    },
    {
      data: useDelegationCap(),
      label: 'Delegation Cap'
    }
  ];

  return (
    <div className='container p-0'>
      <Meta />

      <div className='d-flex m-0 pb-4 pt-4 pr-4 py4 shadow-sm justify-content-between'>
        {cards.map((card) => (
          <Card key={card.label} {...card} />
        ))}
      </div>

      <div className='mt-4'>
        <Staking />
      </div>

      <div className='mt-4'>
        <Withdrawals />
      </div>
    </div>
  );
};

export default withDashboard(Dashboard);
