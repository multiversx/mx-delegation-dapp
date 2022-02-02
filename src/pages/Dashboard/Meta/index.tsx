import * as React from 'react';

import { useGetAccountInfo, getEgldLabel } from '@elrondnetwork/dapp-core';
import { network } from 'config';
import { useDashboard } from '../provider';

import Identity from './components/Identity';

interface MetaType {
  label: string;
  data: string;
}

const Meta: React.FC = () => {
  const egldLabel = getEgldLabel();

  const { address, account } = useGetAccountInfo();
  const {
    denominated,
    isOwner,
    setAdminEnabled,
    adminEnabled: isAdmin
  } = useDashboard();

  const meta: Array<MetaType> = [
    {
      label: 'Contract Address',
      data: network.delegationContract
    },
    {
      label: 'Wallet Address',
      data: address
    },
    {
      label: 'Balance',
      data: `${denominated(account.balance)} ${egldLabel}`
    }
  ];

  return (
    <div className='m-0 pt-4 mt-4 justify-content-between pl-4 pr-4 mb-4 py4 card shadow-sm d-flex flex-row align-items-start'>
      <div>
        {meta.map((item) => (
          <div key={item.label} className='mb-4'>
            <strong>{item.label}: </strong> <br />
            {item.data}
          </div>
        ))}
      </div>

      {isOwner && (
        <div className='d-flex'>
          {isAdmin && <Identity />}

          <button
            type='button'
            onClick={() =>
              setAdminEnabled((adminEnabled: boolean) => !adminEnabled)
            }
            className='btn btn-primary mb-3'
          >
            {isAdmin ? 'Dashboard' : 'Admin'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Meta;
