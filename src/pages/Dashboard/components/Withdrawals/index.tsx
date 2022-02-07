import * as React from 'react';

import { useApp } from 'provider';
import { UndelegateStakeListType } from 'provider/client/callbacks';

import Withdrawal from './components/Withdrawal';

const Withdrawals: React.FC = () => {
  const { undelegatedStakeList } = useApp();

  if (undelegatedStakeList.length === 0) {
    return null;
  }

  return (
    <div className='card mt-spacer'>
      <div className='card-body p-spacer'>
        <div className='d-flex flex-wrap align-items-center justify-content-between mb-spacer'>
          <p className='h6 mb-0'>Pending Withdrawals</p>
        </div>
        <div className='table-responsive'>
          <table className='table table-borderless mb-0'>
            <thead className='text-uppercase font-weight-normal'>
              <tr>
                <th>Undelegated Amount</th>
                <th>Wait Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {undelegatedStakeList.map(
                (withdrawal: UndelegateStakeListType) => (
                  <Withdrawal key={withdrawal.timeLeft} {...withdrawal} />
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
