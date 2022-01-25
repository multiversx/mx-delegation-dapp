import * as React from 'react';

import { useGetAccountInfo, getEgldLabel } from '@elrondnetwork/dapp-core';
import { network } from 'config';
import { useDashboard } from '../provider';

interface MetaType {
  label: string;
  data: string;
}

const Meta: React.FC = () => {
  const egldLabel = getEgldLabel();

  const { denominated } = useDashboard();
  const { address, account } = useGetAccountInfo();

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
    <div className='m-0 pt-4 mt-4 pl-4 pr-4 mb-4 py4 card shadow-sm'>
      {meta.map((item) => (
        <div key={item.label} className='mb-4'>
          <strong>{item.label}: </strong> <br />
          {item.data}
        </div>
      ))}
    </div>
  );
};

export default Meta;
