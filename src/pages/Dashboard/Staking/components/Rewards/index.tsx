import { ChainID } from '@elrondnetwork/erdjs';

import transact from 'pages/Dashboard/helpers/transact';
import { getAccountProvider } from '@elrondnetwork/dapp-core';

import * as React from 'react';

const Rewards: React.FC = () => {
  const onClaim = async (): Promise<void> => {
    try {
      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };

      const payload = {
        value: '0',
        type: 'claimRewards',
        args: '',
        chainId: new ChainID('T')
      };

      await transact(parameters, payload);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button className='btn btn-primary mx-2' onClick={onClaim}>
      Claim Rewards
    </button>
  );
};

export default Rewards;
