import * as React from 'react';
import { useEffect, useState, MouseEvent, Fragment } from 'react';

import { transactionServices } from '@elrondnetwork/dapp-core';
import {
  ProxyProvider,
  Query,
  Address,
  ContractFunction
} from '@elrondnetwork/erdjs';
import {
  faPlus,
  faServer,
  faTimes,
  faCheck,
  faExternalLinkAlt,
  faAngleDown
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown } from 'react-bootstrap';

import Action from 'components/Action';
import { network } from 'config';
import { useDispatch, useGlobalContext } from 'context';
import modifiable from 'helpers/modifiable';

import useTransaction from 'helpers/useTransaction';

import Add from './components/Add';

import styles from './styles.module.scss';

interface NodeType {
  code: string;
  status: any;
}

interface VariantsType {
  [key: string]: any;
}

interface ArgumentsType {
  value: string;
  type: string;
  args: string;
}

interface ActionsType {
  key: string;
  label: string;
  callback: (value: string) => ArgumentsType;
}

const Nodes: React.FC = () => {
  const [data, setData] = useState<Array<NodeType>>([]);
  const { nodesData } = useGlobalContext();
  const { sendTransaction } = useTransaction();
  const { success, hasActiveTransactions } =
    transactionServices.useGetActiveTransactionsStatus();

  const dispatch = useDispatch();
  const isLoading = nodesData.status === 'loading';

  const variants: VariantsType = {
    staked: {
      label: 'Staked',
      color: 'success',
      actions: ['unStake']
    },
    jailed: {
      label: 'Jail',
      color: 'danger',
      actions: ['unJail']
    },
    queued: {
      label: 'Queued',
      color: 'warning',
      actions: ['unStake']
    },
    unStaked: {
      label: 'UnStaked',
      color: 'warning',
      actions: ['unBond', 'reStake']
    },
    notStaked: {
      label: 'Inactive',
      color: 'warning',
      actions: ['stake', 'remove']
    }
  };

  const actions: Array<ActionsType> = [
    {
      key: 'unStake',
      label: 'Unstake',
      callback: (value: string) => ({
        value: '0',
        type: 'unStakeNodes',
        args: value
      })
    },
    {
      key: 'reStake',
      label: 'ReStake',
      callback: (value: string) => ({
        value: '0',
        type: 'reStakeUnStakedNodes',
        args: value
      })
    },
    {
      key: 'unJail',
      label: 'Unjail',
      callback: (value: string) => ({
        value: '2.5',
        type: 'unJailNodes',
        args: value
      })
    },
    {
      key: 'unBond',
      label: 'Unbond',
      callback: (value: string) => ({
        value: '0',
        type: 'unBondNodes',
        args: value
      })
    },
    {
      key: 'stake',
      label: 'Stake',
      callback: (value: string) => ({
        value: '0',
        type: 'stakeNodes',
        args: `${value}`
      })
    },
    {
      key: 'remove',
      label: 'Remove',
      callback: (value: string) => ({
        value: '0',
        type: 'removeNodes',
        args: `${value}`
      })
    }
  ];

  const onAct = async ({ value, type, args }: ArgumentsType): Promise<void> => {
    try {
      await sendTransaction({
        args,
        type,
        value
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getNodes = () => {
    if (nodesData.data && nodesData.data.length > 0) {
      const calculateNodes = (nodes: Array<any>) => {
        const statuses: Array<string> = [];

        return nodes.reduce((items: any, item: any) => {
          const current = String(item);
          const status: string = statuses[statuses.length - 1];

          if (variants[current]) {
            statuses.push(current);
            return items;
          } else {
            return [
              ...items,
              {
                code: item.toString('hex'),
                status
              }
            ];
          }
        }, []);
      };

      setData(
        calculateNodes(nodesData.data).map((node: NodeType) => ({
          ...node,
          status: variants[node.status]
        }))
      );
    }

    return () => setData([]);
  };

  const getNodesData = async (): Promise<void> => {
    dispatch({
      type: 'getNodesData',
      nodesData: {
        status: 'loading',
        data: null,
        error: null
      }
    });

    try {
      const provider = new ProxyProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getAllNodeStates')
      });

      const response = await provider.queryContract(query);

      dispatch({
        type: 'getNodesData',
        nodesData: {
          status: 'loaded',
          data: response.outputUntyped(),
          error: null
        }
      });
    } catch (error) {
      dispatch({
        type: 'getNodesData',
        nodesData: {
          status: 'error',
          data: null,
          error
        }
      });
    }
  };

  const fetchNodes = () => {
    if (!nodesData.data) {
      getNodesData();
    }
  };

  const refetchNodes = () => {
    if (success && hasActiveTransactions && nodesData.data) {
      getNodes();
      getNodesData();
    }
  };

  useEffect(fetchNodes, [nodesData.data]);
  useEffect(getNodes, [nodesData.data, success]);
  useEffect(refetchNodes, [hasActiveTransactions, success]);

  return (
    <div className={styles.nodes}>
      <div className={styles.heading}>
        <span className={styles.title}>My Nodes</span>

        <Action
          title='Add Nodes'
          trigger={
            <div className={styles.button}>
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
              <span>Add Nodes</span>
            </div>
          }
          render={<Add />}
        />
      </div>

      <div className={styles.body}>
        {isLoading || nodesData.error || data.length === 0 ? (
          <Fragment>
            <div className={styles.server}>
              <FontAwesomeIcon icon={faServer} size='2x' />
            </div>

            <div className={styles.message}>
              {isLoading
                ? 'Retrieving keys...'
                : nodesData.error
                ? 'An error occurred attempting to retrieve keys.'
                : 'No keys found for this contract.'}
            </div>
          </Fragment>
        ) : (
          data.map((node: NodeType) => (
            <div key={node.code} className={styles.node}>
              <div className={styles.left}>
                <span className={styles.icon}>
                  <FontAwesomeIcon icon={faServer} />
                </span>

                <a
                  href={`${network.explorerAddress}nodes/${node.code}`}
                  target='_blank'
                  rel='noreferrer'
                  className={styles.link}
                >
                  <span className={styles.code}>{node.code}</span>

                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </a>
              </div>

              <div className={styles.right}>
                {node.status && (
                  <span
                    className={modifiable(
                      'status',
                      [node.status.color],
                      styles
                    )}
                  >
                    <span className={styles.icon}>
                      <FontAwesomeIcon
                        icon={
                          node.status.color === 'success' ? faCheck : faTimes
                        }
                        size='sm'
                      />
                    </span>

                    {node.status.label}
                  </span>
                )}

                <Dropdown>
                  <Dropdown.Toggle className={styles.toggle}>
                    <span>Action</span>

                    <div className={styles.angle}>
                      <FontAwesomeIcon icon={faAngleDown} />
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className={styles.menu}>
                    {actions.map((action) => {
                      const disabled = !node.status.actions.includes(
                        action.key
                      );

                      return (
                        <Dropdown.Item
                          key={action.key}
                          className={modifiable(
                            'action',
                            [disabled && 'disabled'],
                            styles
                          )}
                          onClick={(event: MouseEvent) => {
                            event.preventDefault();
                            onAct(action.callback(node.code));
                          }}
                        >
                          {action.label}
                        </Dropdown.Item>
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Nodes;
