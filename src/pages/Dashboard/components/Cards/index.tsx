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
import {
  faUsers,
  faServer,
  faLeaf,
  faReceipt,
  faArrowUp,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Logo from 'assets/Logo';
import { network } from 'config';
import { useGlobalContext, useDispatch } from 'context';
import { denominated } from 'helpers/denominate';
import getPercentage from 'helpers/getPercentage';
import modifiable from 'helpers/modifiable';
import Action from 'pages/Dashboard/components/Action';
import ChangeDelegationCap from './components/ChangeDelegationCap';
import ChangeServiceFee from './components/ChangeServiceFee';

import styles from './styles.module.scss';

interface CardType {
  label: string;
  colors: Array<string>;
  data: {
    value?: string | null;
    percentage?: string | undefined;
  };
  title?: string;
  description?: string;
  modal?: ReactNode;
  icon: ReactNode;
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
      const provider = new ProxyProvider(network.apiAddress);
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
        value: loading ? `... ${network.egldLabel}` : 'Stake Unknown',
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
        value: loading ? '...' : 'Nodes Unknown',
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
        value: loading ? `... ${network.egldLabel}` : 'Cap Unknown',
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
      data: getContractStakeData(),
      colors: ['#2044F5', '#1B37C0'],
      icon: <Logo />
    },
    {
      label: 'Number of Users',
      colors: ['#6CADEF', '#5B96D2'],
      icon: <FontAwesomeIcon icon={faUsers} />,
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
      icon: <FontAwesomeIcon icon={faServer} />,
      colors: ['#36CA8C', '#2BA572'],
      data: getNodesNumber()
    },
    {
      label: 'Computed APR',
      colors: ['#FBC34C', '#D49712'],
      icon: <FontAwesomeIcon icon={faLeaf} />,
      data: {
        value: '37.45%',
        percentage: 'Including Service Fee'
      }
    },
    {
      label: 'Service Fee',
      modal: <ChangeServiceFee />,
      icon: <FontAwesomeIcon icon={faReceipt} />,
      title: 'Change service fee',
      description:
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      colors: ['#F3BF89', '#B68350'],
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
      modal: <ChangeDelegationCap />,
      description: `The delegation cap is the maximum amount of ${network.egldLabel} your agency can stake from delegators.`,
      title: 'Delegation Cap',
      icon: <FontAwesomeIcon icon={faArrowUp} />,
      colors: ['#E48570', '#C25C45'],
      data: getDelegationCap()
    }
  ];

  const fetchUsersNumber = () => {
    if (!usersNumber.data) {
      getUsersNumber();
    }
  };

  const fetchTotalNetworkStake = () => {
    if (!totalNetworkStake.data) {
      getTotalNetworkStake();
    }
  };

  useEffect(fetchUsersNumber, [usersNumber.data]);
  useEffect(fetchTotalNetworkStake, [totalNetworkStake.data]);

  return (
    <div className={styles.cards}>
      {cards.map((card) => {
        const [alpha, beta] = card.colors;
        const background = `linear-gradient(180deg, ${alpha} 0%, ${beta} 100%)`;
        const interactive = card.modal && adminView;

        return (
          <div key={card.label} className={styles.card} style={{ background }}>
            <div className={styles.heading}>
              <span>{card.label}</span>
              <div
                style={{ fill: interactive ? beta : 'white' }}
                className={modifiable('icon', [interactive && 'fill'], styles)}
              >
                {interactive ? (
                  <Action
                    render={card.modal}
                    title={card.title}
                    description={card.description}
                    trigger={
                      <span className={styles.trigger}>
                        <FontAwesomeIcon icon={faCog} size='lg' />
                      </span>
                    }
                  />
                ) : (
                  card.icon
                )}
              </div>
            </div>

            <div className={styles.value}>{card.data.value}</div>

            {card.data.percentage && <span>{card.data.percentage}</span>}
          </div>
        );
      })}
    </div>
  );
};

export default Cards;
