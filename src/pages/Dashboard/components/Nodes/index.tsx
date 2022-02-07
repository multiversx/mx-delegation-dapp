import * as React from 'react';
import { useEffect, useState, MouseEvent } from 'react';

import { getAccountProvider } from '@elrondnetwork/dapp-core';
import { decodeString, ChainID } from '@elrondnetwork/erdjs';
import { Dropdown } from 'react-bootstrap';

import { network } from 'config';

import transact from 'helpers/transact';

import { useApp } from 'provider';

import Add from './components/Add';
import { DropzonePayloadType } from './components/Dropzone';

interface StatusType {
  label: string;
  color: string;
  actions: Array<string>;
}

interface NodeType {
  code: string;
  status: StatusType;
}

interface VariantsType {
  [key: string]: StatusType;
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
  const { nodesNumber, nodesData } = useApp();

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
      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };

      const payload = {
        args,
        type,
        value,
        chainId: new ChainID('T')
      };

      await transact(parameters, payload);
    } catch (error) {
      console.error(error);
    }
  };

  const getNodes = () => {
    if (nodesData.length > 0 && nodesNumber.length > 0) {
      const sort = (alpha: Array<Uint8Array>, beta: Array<Uint8Array>) =>
        alpha.length - beta.length;
      const output = [nodesData, nodesNumber.sort(sort)];

      const [nodes, keys] = output.map((payload) => {
        const statuses: Array<string> = [];

        return payload.reduce(
          (items: Array<DropzonePayloadType>, item: Buffer) => {
            const current: string = decodeString(item);
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
          },
          []
        );
      });

      setData(
        nodes.map((node: NodeType) => {
          const index = keys.findIndex(
            (key: NodeType) => key.code === node.code
          );
          const key = index >= 0 ? keys[index].status : node.status;

          return {
            ...node,
            status: variants[key]
          };
        })
      );
    }

    return () => setData([]);
  };

  useEffect(getNodes, [nodesNumber, nodesData]);

  return (
    <div className='card mt-spacer'>
      <div className='card-body p-spacer'>
        <div className='d-flex flex-wrap align-items-center justify-content-between mb-spacer'>
          <p className='h6 mb-3'>My Nodes</p>
          <div className='d-flex'>
            <Add />
          </div>
        </div>
        {data.length > 0 ? (
          <div className='table-responsive' style={{ overflow: 'visible' }}>
            <table
              className='table table-borderless mb-0'
              style={{ tableLayout: 'fixed' }}
            >
              <thead className='text-uppercase font-weight-normal'>
                <tr>
                  <th style={{ width: '50%' }}>Public key</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((node: NodeType) => (
                  <tr key={node.code}>
                    <td
                      style={{
                        maxWidth: '50%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'break-word'
                      }}
                    >
                      <div className='d-flex align-items-center text-nowrap '>
                        <a
                          href={`${network.explorerAddress}nodes/${node.code}`}
                          target='_blank'
                          className='ml-2'
                          rel='noreferrer'
                        >
                          <span className='text-truncate'>{node.code}</span>
                        </a>
                      </div>
                    </td>
                    <td>
                      {node.status && (
                        <span
                          className={`badge badge-sm badge-light-${node.status.color} text-${node.status.color}`}
                        >
                          {node.status.label}
                        </span>
                      )}
                    </td>

                    <td>
                      <Dropdown className='ml-auto'>
                        <Dropdown.Toggle
                          variant=''
                          className='btn btn-sm btn-primary action-dropdown'
                        ></Dropdown.Toggle>

                        <Dropdown.Menu>
                          {actions.map((action) => {
                            const isDisabled = !node.status.actions.includes(
                              action.key
                            );

                            return (
                              <Dropdown.Item
                                key={action.key}
                                className={`dropdown-item ${
                                  isDisabled && 'disabled'
                                }`}
                                onClick={(event: MouseEvent) => {
                                  event.preventDefault();
                                  onAct(action.callback(node.code));
                                }}
                              >
                                <span
                                  style={{
                                    color: isDisabled ? 'lightgrey' : 'black'
                                  }}
                                >
                                  {action.label}
                                </span>
                              </Dropdown.Item>
                            );
                          })}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <span>No keys found for this contract.</span>
        )}
      </div>
    </div>
  );
};

export default Nodes;
