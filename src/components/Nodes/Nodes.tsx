import { useEffect, useState, Fragment, useCallback } from 'react';
import {
  faPlus,
  faServer,
  faTimes,
  faCheck,
  faExternalLinkAlt,
  faAngleDown
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ContractFunction,
  Address,
  Query,
  BytesValue
} from '@multiversx/sdk-core';
import { useGetActiveTransactionsStatus } from '@multiversx/sdk-dapp/hooks/transactions/useGetActiveTransactionsStatus';
import { useGetSuccessfulTransactions } from '@multiversx/sdk-dapp/hooks/transactions/useGetSuccessfulTransactions';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import classNames from 'classnames';
import { Dropdown } from 'react-bootstrap';

import { Action } from 'components/Action';
import { network, auctionContract, stakingContract } from 'config';
import { useGlobalContext } from 'context';
import useTransaction from 'helpers/useTransaction';

import { Add } from './components/Add';

import styles from './styles.module.scss';
import variants from './variants.json';

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

const actions: ActionsType[] = [
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

export const Nodes = () => {
  const { nodesNumber, nodesStates } = useGlobalContext();
  const { sendTransaction } = useTransaction();
  const { pending } = useGetActiveTransactionsStatus();
  const { hasSuccessfulTransactions, successfulTransactionsArray } =
    useGetSuccessfulTransactions();

  const [data, setData] = useState<NodeType[]>([]);
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
      const response = await provider.queryContract(parameters);

      return response.returnData.map(decode);
    };

    const payload = await Promise.all([query, queue].map(queryContract));
    const [position, size] = payload.map(([item]) => String(item));

    return `${position}/${size}`;
  }, []);

  const calculateNodes = useCallback(
    (nodes: any[]) =>
      nodes.reduce((result: any, _, index, array) => {
        if (index % 2 === 0) {
          const [code, status]: any[] = array.slice(index, index + 2);
          const item: any = {
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
    (nodes: NodeType[]) =>
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
    const fetchData = async (nodes: any[], states: any[]) => {
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

          const node: any = {
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

    if (nodesNumber.data && nodesStates.data) {
      fetchData(nodesNumber.data, nodesStates.data);
    }

    return () => setData([]);
  };

  const refetchNodes = () => {
    if (
      hasSuccessfulTransactions &&
      nodesNumber.data &&
      successfulTransactionsArray.length > 0
    ) {
      getNodes();
    }
  };

  useEffect(getNodes, [nodesNumber.data, nodesStates.data]);
  useEffect(refetchNodes, [
    hasSuccessfulTransactions,
    successfulTransactionsArray.length
  ]);

  return (
    <div className={`${styles.nodes} nodes`}>
      <div className={styles.heading}>
        <span className={styles.title}>My Nodes</span>

        <Action
          title='Add Nodes'
          disabled={pending}
          trigger={
            <div
              className={classNames(styles.button, {
                [styles.disabled]: pending
              })}
            >
              <div className={styles.icon}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
              <span>Add Nodes</span>
            </div>
          }
          render={() => <Add />}
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
                    className={classNames(
                      styles.status,
                      styles[node.status.color]
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
                  <Dropdown.Toggle
                    className={classNames(styles.toggle, {
                      [styles.disabled]: pending
                    })}
                  >
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
                          className={classNames(styles.action, {
                            [styles.disabled]: disabled
                          })}
                          onClick={() => {
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
