import * as React from 'react';
import { useCallback } from 'react';

import { getEgldLabel } from '@elrondnetwork/dapp-core';
import { decodeString } from '@elrondnetwork/erdjs';
import { denominated } from 'helpers/denominate';
import getPercentage from 'helpers/getPercentage';

import { useDashboard } from 'pages/Dashboard/provider';
import { useApp } from 'provider';
import Action from '../Action';

import ChangeAutomaticActivation from './components/ChangeAutomaticActivation';
import ChangeDelegationCap from './components/ChangeDelegationCap';
import ChangeRedelegationCap from './components/ChangeRedelegationCap';
import ChangeServiceFee from './components/ChangeServiceFee';

interface CardType {
  label: string;
  data: {
    value?: string;
    percentage?: string | undefined;
  };
  title?: string;
  description?: string;
  modal?: any; // TODO: React.ReactNode
}

const Cards: React.FC = () => {
  // TODO: all strongly typed
  const {
    totalActiveStake,
    totalNetworkStake,
    usersNumber,
    nodesNumber,
    serviceFee,
    delegationCap,
    automaticActivation,
    redelegationCap
  } = useApp();
  const { adminEnabled } = useDashboard();

  const getContractStakeData = useCallback(() => {
    if (!totalNetworkStake.TotalStaked) {
      return {};
    }

    const formatted = {
      stake: denominated(totalNetworkStake.TotalStaked.toFixed()),
      nodes: denominated(totalActiveStake)
    };

    return {
      value: `${formatted.nodes} ${egldLabel}`,
      percentage: `${getPercentage(
        formatted.nodes,
        formatted.stake
      )}% of total stake`
    };
  }, [totalNetworkStake, totalActiveStake]);

  const getNodesNumber = useCallback(() => {
    if (!totalNetworkStake.TotalStaked) {
      return {};
    }

    const formatted = {
      stake: totalNetworkStake.TotalValidators.toString(),
      nodes: nodesNumber
        .filter((key: Buffer) => decodeString(key) === 'staked')
        .length.toString()
    };

    return {
      value: formatted.nodes,
      percentage: `${getPercentage(
        formatted.nodes,
        formatted.stake
      )}% of total nodes`
    };
  }, [totalNetworkStake, nodesNumber]);

  const getDelegationCap = useCallback(() => {
    const formatted = {
      stake: denominated(totalActiveStake),
      value: denominated(delegationCap)
    };

    return {
      value: `${formatted.value} ${egldLabel}`,
      percentage: `${getPercentage(formatted.stake, formatted.value)}% filled`
    };
  }, [totalActiveStake, delegationCap]);

  const egldLabel = getEgldLabel(); // TODO: get from network config
  const cards: Array<CardType> = [
    {
      label: 'Contract Stake',
      data: getContractStakeData()
    },
    {
      label: 'Number of Users',
      data: {
        value: usersNumber
      }
    },
    {
      label: 'Number of Nodes',
      data: getNodesNumber()
    },
    {
      label: 'Service Fee',
      modal: <ChangeServiceFee />,
      title: 'Change service fee',
      description:
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      data: {
        value: serviceFee
      }
    },
    {
      label: 'Delegation Cap',
      title: 'Delegation Cap',
      modal: <ChangeDelegationCap />,
      description:
        'The delegation cap is the maximum amount of xEGLD your agency can stake from delegators.',
      data: getDelegationCap()
    },
    {
      label: 'Automatic Activation',
      title: 'Automatic Activation',
      description: 'Set automatic activation',
      modal: <ChangeAutomaticActivation />,
      data: {
        value: automaticActivation
      }
    },
    {
      label: 'ReDelegateCap',
      title: 'Check for ReDelegate Rewards Max Cap',
      modal: <ChangeRedelegationCap />,
      description:
        'Set the check for ReDelegation Cap in order to block or accept the redelegate rewards.',
      data: {
        value: redelegationCap
      }
    }
  ];

  return (
    <div className='d-flex m-0 flex-wrap justify-content-between'>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{ flexGrow: 1, width: '20%' }}
          className='card p-4 m-0 grow'
        >
          <span>{card.label}</span>

          <span className='mt-3'>{card.data.value}</span>

          {card.data.percentage && (
            <span className='mt-3'>{card.data.percentage}</span>
          )}

          {card.modal && adminEnabled && (
            <div className='position-absolute mr-4' style={{ right: '0' }}>
              <Action
                title={card.title}
                description={card.description}
                trigger='Change'
                render={card.modal}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Cards;
