import React, { FC, useCallback, useEffect, ReactNode } from 'react';

import { denominate } from '/src/helpers/denominate';

import { ProxyNetworkProvider, ApiNetworkProvider } from "@elrondnetwork/erdjs-network-providers";

import {
  decodeUnsignedNumber,
  ContractFunction,
  Address,
  Query,
  decodeString,
  ResultsParser
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

import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Logo from '/src/assets/Logo';

import Action from '/src/components/Action';
import { network, auctionContract } from '/src/config';
import { useGlobalContext, useDispatch } from '/src/context';
import getPercentage from '/src/helpers/getPercentage';
import modifiable from '/src/helpers/modifiable';
import ChangeDelegationCap from './components/ChangeDelegationCap';
import ChangeServiceFee from './components/ChangeServiceFee';

import calculateAnnualPercentage from './helpers/calculateAnnualPercentage';

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

const Cards: FC = () => {
  const {
    totalActiveStake,
    totalNetworkStake,
    usersNumber,
    nodesNumber,
    networkStatus,
    contractDetails,
    networkConfig
  } = useGlobalContext();
  const dispatch = useDispatch();
  const location = useLocation();

  const getNetworkStatus = async (): Promise<void> => {
    dispatch({
      type: 'getNetworkStatus',
      networkStatus: {
        status: 'loading',
        data: null,
        error: null
      }
    });

    try {
      const [status, balance] = await Promise.all([
        new ProxyNetworkProvider(network.gatewayAddress).getNetworkStatus(),
        axios.get(`${network.apiAddress}/accounts/${auctionContract}`)
      ]);

      dispatch({
        type: 'getNetworkStatus',
        networkStatus: {
          status: 'loaded',
          error: null,
          data: {
            ...status,
            Balance: balance.data.balance
          }
        }
      });
    } catch (error) {
      dispatch({
        type: 'getNetworkStatus',
        networkStatus: {
          status: 'error',
          data: null,
          error
        }
      });
    }
  };

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
      const provider = new ProxyNetworkProvider(network.apiAddress);
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getNumUsers')
      });

      const queryResponse = await provider.queryContract(query);
      const {values} = new ResultsParser().parseUntypedQueryResponse(queryResponse);
      //const [userNumber] = data.outputUntyped();

      dispatch({
        type: 'getUsersNumber',
        usersNumber: {
          status: 'loaded',
          data: decodeUnsignedNumber(values[0]).toString(),
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
      stake: denominate({ input: totalNetworkStake.data.TotalStaked.toFixed() }),
      contractStake: denominate({ input: totalActiveStake.data, decimals: 2, showLastNonZeroDecimal: false })
    };

    return {
      value: `${formatted.contractStake} ${network.egldLabel}`,
      percentage: `${getPercentage(
        formatted.contractStake,
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
        value: loading ? '' : 'Nodes Unknown',
        percentage: loading ? ' % of total nodes' : 'Data Unavailable'
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
      stake: denominate({ input: totalActiveStake.data }),
      value: denominate({ input: contractDetails.data.delegationCap })
    };

    return {
      value: `${formatted.value} ${network.egldLabel}`,
      percentage: `${getPercentage(formatted.stake, formatted.value)}% filled`
    };
  }, [totalActiveStake.data, contractDetails.data]);

  const getAnnualPercentage = () => {
    const dependencies = [
      totalActiveStake,
      nodesNumber,
      networkStatus,
      totalNetworkStake,
      networkConfig,
      contractDetails
    ];

    if (dependencies.some((dependency) => dependency.status === 'loading')) {
      return '...%';
    }

    if (dependencies.every((dependency) => dependency.data)) {
      const percentage = calculateAnnualPercentage({
        activeStake: totalActiveStake.data,
        blsKeys: nodesNumber.data,
        networkStatus: networkStatus.data,
        networkStake: totalNetworkStake.data,
        networkConfig: networkConfig.data,
        serviceFee: parseFloat(
          contractDetails.data
            ? contractDetails.data.serviceFee.replace('%', '')
            : '0'
        )
      });

      return `${percentage}%`;
    }

    return 'Unknown APR';
  };

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
              : ''
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
        value: getAnnualPercentage(),
        percentage: 'Including Service Fee'
      }
    },
    {
      label: 'Service Fee',
      modal: <ChangeServiceFee />,
      icon: <FontAwesomeIcon icon={faReceipt} />,
      title: 'Change service fee',
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

  const fetchNetworkStatus = () => {
    if (!networkStatus.data) {
      getNetworkStatus();
    }
  };

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
  useEffect(fetchNetworkStatus, [networkStatus.data]);
  useEffect(fetchTotalNetworkStake, [totalNetworkStake.data]);

  return (
    <div className={`${styles.cards} cards`}>
      {cards.map((card) => {
        const [alpha, beta] = card.colors;
        const background = `linear-gradient(180deg, ${alpha} 0%, ${beta} 100%)`;
        const interactive = card.modal && location.pathname === '/admin';

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
