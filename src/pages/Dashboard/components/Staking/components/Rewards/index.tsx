import * as React from 'react';

import useTransaction from 'helpers/useTransaction';

const Rewards: React.FC = () => {
  const { sendTransaction } = useTransaction();

  const onClaim = async (): Promise<void> => {
    try {
      await sendTransaction({
        value: '0',
        type: 'claimRewards',
        args: ''
      });
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
