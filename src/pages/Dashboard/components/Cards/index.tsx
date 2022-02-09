import * as React from 'react';
import { useCallback, useEffect, ReactNode } from 'react';

import {
  decodeUnsignedNumber,
  ContractFunction,
  ProxyProvider,
  Address,
  Query,
  decodeString,
  ApiProvider
} from '@elrondnetwork/erdjs';
import { network } from 'config';
import { useGlobalContext, useDispatch } from 'context';
import { denominated } from 'helpers/denominate';
import getPercentage from 'helpers/getPercentage';

import Action from 'pages/Dashboard/components/Action';

import ChangeAutomaticActivation from './components/ChangeAutomaticActivation';
import ChangeDelegationCap from './components/ChangeDelegationCap';
import ChangeRedelegationCap from './components/ChangeRedelegationCap';
import ChangeServiceFee from './components/ChangeServiceFee';

interface CardType {
  label: string;
  data: {
    value?: string | null;
    percentage?: string | undefined;
  };
  title?: string;
  description?: string;
  modal?: ReactNode;
}

const Cards: React.FC = () => {
  const {
    totalActiveStake,
    totalNetworkStake,
    usersNumber,
    nodesNumber,
    contractDetails,
    adminView
  } = useGlobalContext();
  const dispatch = useDispatch();

  const getUsersNumber = async (): Promise<void> => {
    dispatch({
      type: 'getUsersNumber',
      usersNumber: {
        status: 'loading',
        data: null,
        error: null
      }
    });

    try {
      const provider = new ProxyProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getNumUsers')
      });

      const data = await provider.queryContract(query);
      const [userNumber] = data.outputUntyped();

      dispatch({
        type: 'getUsersNumber',
        usersNumber: {
          status: 'loaded',
          data: decodeUnsignedNumber(userNumber).toString(),
          error: null
        }
      });
    } catch (error) {
      dispatch({
        type: 'getUsersNumber',
        usersNumber: {
          status: 'error',
          data: null,
          error
        }
      });
    }
  };

  const getTotalNetworkStake = async (): Promise<void> => {
    dispatch({
      type: 'getTotalNetworkStake',
      totalNetworkStake: {
        data: null,
        error: null,
        status: 'loading'
      }
    });

    try {
      const query = new ApiProvider(network.apiAddress, {
        timeout: 4000
      });

      const data = await query.getNetworkStake();

      dispatch({
        type: 'getTotalNetworkStake',
        totalNetworkStake: {
          status: 'loaded',
          error: null,
          data
        }
      });
    } catch (error) {
      dispatch({
        type: 'getTotalNetworkStake',
        totalNetworkStake: {
          status: 'error',
          data: null,
          error
        }
      });
    }
  };

  const getContractStakeData = useCallback(() => {
    if (!totalNetworkStake.data || !totalActiveStake.data) {
      const loading =
        totalNetworkStake.status === 'loading' ||
        totalActiveStake.status === 'loading';

      return {
        value: loading ? `... ${network.egldLabel}` : 'Contract Stake Unknown',
        percentage: loading ? '...%' : 'Data Unavailable'
      };
    }

    const formatted = {
      stake: denominated(totalNetworkStake.data.TotalStaked.toFixed()),
      nodes: denominated(totalActiveStake.data)
    };

    return {
      value: `${formatted.nodes} ${network.egldLabel}`,
      percentage: `${getPercentage(
        formatted.nodes,
        formatted.stake
      )}% of total stake`
    };
  }, [totalNetworkStake, totalActiveStake.data]);

  const getNodesNumber = useCallback(() => {
    if (!totalNetworkStake.data || !nodesNumber.data) {
      const loading =
        totalNetworkStake.status === 'loading' ||
        nodesNumber.status === 'loading';

      return {
        value: loading ? '...' : 'Nodes Count Unknown',
        percentage: loading ? '...% of total nodes' : 'Data Unavailable'
      };
    }

    const formatted = {
      stake: totalNetworkStake.data.TotalValidators.toString(),
      nodes: nodesNumber.data
        .filter((key: any) => decodeString(key) === 'staked')
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
    if (!contractDetails.data || !totalActiveStake.data) {
      const loading =
        totalActiveStake.status === 'loading' ||
        contractDetails.status === 'loading';

      return {
        value: loading ? `... ${network.egldLabel}` : 'Delegation Cap Unknown',
        percentage: loading ? '...%' : 'Data Unavailable'
      };
    }

    const formatted = {
      stake: denominated(totalActiveStake.data),
      value: denominated(contractDetails.data.delegationCap)
    };

    return {
      value: `${formatted.value} ${network.egldLabel}`,
      percentage: `${getPercentage(formatted.stake, formatted.value)}% filled`
    };
  }, [totalActiveStake.data, contractDetails.data]);

  const cards: Array<CardType> = [
    {
      label: 'Contract Stake',
      data: getContractStakeData()
    },
    {
      label: 'Number of Users',
      data: {
        value:
          usersNumber.status !== 'loaded'
            ? usersNumber.error
              ? 'Data Unavailable'
              : '...'
            : usersNumber.data
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
        value: contractDetails.data
          ? contractDetails.data.serviceFee
          : contractDetails.error
          ? 'Service Fee Unknown'
          : '...%'
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
        value: contractDetails.data
          ? contractDetails.data.serviceFee
          : contractDetails.error
          ? 'Activation Status Unknown'
          : '...%'
      }
    },
    {
      label: 'ReDelegateCap',
      title: 'Check for ReDelegate Rewards Max Cap',
      modal: <ChangeRedelegationCap />,
      description:
        'Set the check for ReDelegation Cap in order to block or accept the redelegate rewards.',
      data: {
        value: contractDetails.data
          ? contractDetails.data.redelegationCap
          : contractDetails.error
          ? 'Redelegation Status Unknown'
          : '...%'
      }
    }
  ];

  useEffect(() => {
    if (!usersNumber.data) {
      getUsersNumber();
    }
  }, [usersNumber.data]);

  useEffect(() => {
    if (!totalNetworkStake.data) {
      getTotalNetworkStake();
    }
  }, [totalNetworkStake.data]);

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

          {card.modal && adminView && (
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
