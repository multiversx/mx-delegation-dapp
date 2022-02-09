import * as React from 'react';
import { useState, useEffect } from 'react';

import moment from 'moment';
import { network } from 'config';
import { UndelegateStakeListType } from 'context/state';
import useTransaction from 'helpers/useTransaction';

const Withdrawal: React.FC<UndelegateStakeListType> = ({ value, timeLeft }) => {
  const [disabled, setDisabled] = useState<boolean>(timeLeft !== 0);
  const [counter, setCounter] = useState<number>(timeLeft);
  const { sendTransaction } = useTransaction();

  const getTimeLeft = (): string =>
    moment
      .utc(moment.duration(counter, 'seconds').asMilliseconds())
      .format('HH:mm:ss');

  const onWithdraw = async (): Promise<void> => {
    try {
      await sendTransaction({
        args: '',
        type: 'withdraw',
        value: '0'
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (counter > 0) {
      setTimeout(() => setCounter(counter - 1), 1000);
    } else {
      setDisabled(false);
    }

    return () => {
      setCounter(timeLeft);
      setDisabled(timeLeft !== 0);
    };
  }, [counter, timeLeft]);

  return (
    <tr>
      <td>
        <div className='d-flex align-items-center text-nowrap trim'>
          {value} {network.egldLabel}
        </div>
      </td>
      <td>
        <div className='d-flex align-items-center text-nowrap trim'>
          {timeLeft > 0 ? (
            <span className='badge badge-sm badge-light-orange text-orange'>
              {getTimeLeft()} left
            </span>
          ) : (
            <span className='badge badge-sm badge-light-green text-green'>
              Completed
            </span>
          )}
        </div>
      </td>
      <td>
        <button
          disabled={disabled}
          onClick={onWithdraw}
          className='btn btn-primary btn-sm  ml-auto'
        >
          Withdraw
        </button>
      </td>
    </tr>
  );
};

export default Withdrawal;
