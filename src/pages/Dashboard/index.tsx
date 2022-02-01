import * as React from 'react';
import Card, { CardType } from './Card';

import useAutomaticActivation from './hooks/useAutomaticActivation';
import useContractStake from './hooks/useContractStake';
import useDelegationCap from './hooks/useDelegationCap';
import useNodeNumber from './hooks/useNodeNumber';
import useRedelegationCap from './hooks/useRedelegationCap';
import useServiceFee from './hooks/useServiceFee';
import useUserNumber from './hooks/useUserNumber';

import Meta from './Meta';

import { withDashboard } from './provider';

import Staking from './Staking';
import Withdrawals from './Withdrawals';

const Dashboard: React.FC = () => {
  const cards: Array<CardType> = [
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
    },
    {
      data: useAutomaticActivation(),
      label: 'Automatic Activation'
    },
    {
      data: useRedelegationCap(),
      label: 'ReDelegateCap'
    }
  ];

  return (
    <div className='container p-0'>
      <Meta />

      <div className='d-flex m-0 flex-wrap justify-content-between'>
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
