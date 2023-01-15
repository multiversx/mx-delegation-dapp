import React, {
  FC,
  useEffect,
  useState,
  MouseEvent,
  Fragment,
  useCallback
} from 'react';
import {
  ProxyNetworkProvider,
  ApiNetworkProvider
} from '@multiversx/sdk-network-providers';
import {
  ContractFunction,
  Address,
  Query,
  BytesValue
} from '@multiversx/sdk-core';
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

import Action from '../Action';
import { network, auctionContract, stakingContract } from '/src/config';
import { useGlobalContext } from '/src/context';
import modifiable from '/src/helpers/modifiable';

import useTransaction from '/src/helpers/useTransaction';

import Add from './components/Add';
import styles from './styles.module.scss';
import variants from './variants.json';
import { useGetActiveTransactionsStatus } from '@multiversx/sdk-dapp/hooks';

interface NodeType {
  code: string;
  status: any;
  position?: string;
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

const Nodes: FC = () => {
  const [data, setData] = useState<Array<NodeType>>([]);
  const { nodesNumber, nodesStates } = useGlobalContext();
  const { sendTransaction } = useTransaction();
  const { success, pending } = useGetActiveTransactionsStatus();
  const isLoading = nodesNumber.status === 'loading';

  const onAct = useCallback(
    async (parameters: ArgumentsType): Promise<void> => {
      const { value, type, args } = parameters;

      try {
        await sendTransaction({
          args,
          type,
          value
        });
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  const fetchQueue = useCallback(async (key: string) => {
    const provider = new ProxyNetworkProvider(network.apiAddress);
    const query = new Query({
      address: new Address(stakingContract),
      func: new ContractFunction('getQueueIndex'),
      caller: new Address(auctionContract),
      args: [BytesValue.fromHex(key)]
    });

    const queue = new Query({
      address: new Address(stakingContract),
      func: new ContractFunction('getQueueSize')
    });

    const queryContract = async (parameters: Query) => {
      const decode = (item: string) => Buffer.from(item, 'base64');
      const response = await provider.doPostGeneric('vm-values/query', payload);

      return response.data.returnData.map(decode);
    };

    const payload = await Promise.all([query, queue].map(queryContract));
    const [position, size] = payload.map(([item]) => String(item));

    return `${position}/${size}`;
  }, []);

  const calculateNodes = useCallback(
    (nodes: Array<any>) =>
      nodes.reduce((result: any, value, index, array) => {
        if (index % 2 === 0) {
          const [code, status]: Array<any> = array.slice(index, index + 2);
          const item = {
            code: Buffer.from(code, 'base64').toString('hex'),
            status: Buffer.from(status, 'base64').toString()
          };

          return [
            ...result,
            {
              ...item,
              status: (variants as VariantsType)[item.status]
            }
          ];
        }
        return result;
      }, []),
    []
  );

  const assignQueue = useCallback(
    (nodes: Array<NodeType>) =>
      nodes.map(async (node: NodeType) =>
        node.status.label === 'Queued'
          ? {
              ...node,
              position: await fetchQueue(node.code)
            }
          : node
      ),
    []
  );

  const getNodes = () => {
    const fetchData = async (nodes: Array<any>, states: Array<any>) => {
      try {
        const activeNodes = await Promise.all(
          assignQueue(calculateNodes(nodes))
        );
        const inactiveNodes = states.reduce((total, item, index) => {
          const indexes = states.reduce(
            (statuses, status, position) =>
              Object.keys(variants).includes(String(status))
                ? [...statuses, { position, status: String(status) }]
                : statuses,
            []
          );

          const inactive = (unit: any) => unit.status === 'notStaked';
          const position = indexes.findIndex(inactive);
          const start = indexes.find(inactive);
          const end = indexes[position + 1] || { position: states.length };

          const node = {
            code: item.toString('hex'),
            status: variants.notStaked
          };

          if (!start || !end) {
            return total;
          }

          return index > start.position && index < end.position
            ? [...total, node]
            : total;
        }, []);

        setData(activeNodes.concat(inactiveNodes));
      } catch (error) {
        console.error(error);
      }
    };

    if (nodesNumber.data && nodesNumber.data.length > 0 && nodesStates.data) {
      fetchData(nodesNumber.data, nodesStates.data);
    }

    return () => setData([]);
  };

  const refetchNodes = () => {
    if (success && pending && nodesNumber.data) {
      getNodes();
    }
  };

  useEffect(getNodes, [nodesNumber.data, nodesStates.data, success]);
  useEffect(refetchNodes, [pending, success]);

  return (
    <div className={`${styles.nodes} nodes`}>
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
        {isLoading || nodesNumber.error || data.length === 0 ? (
          <Fragment>
            <div className={styles.server}>
              <FontAwesomeIcon icon={faServer} size='2x' />
            </div>

            <div className={styles.message}>
              {isLoading
                ? 'Retrieving keys...'
                : nodesNumber.error
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
                  href={`${network.explorerAddress}/nodes/${node.code}`}
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

                    {node.position
                      ? `${node.status.label} (Position ${node.position})`
                      : node.status.label}
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
