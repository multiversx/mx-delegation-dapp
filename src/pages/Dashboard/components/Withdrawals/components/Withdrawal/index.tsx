import * as React from 'react';
import { useState, useEffect } from 'react';
import { getAccountProvider, getEgldLabel } from '@elrondnetwork/dapp-core';

import { ChainID } from '@elrondnetwork/erdjs';
import moment from 'moment';
import transact from 'helpers/transact';

import { UndelegateStakeListType } from 'provider/client/callbacks';

const Withdrawal: React.FC<UndelegateStakeListType> = ({ value, timeLeft }) => {
  const egldLabel = getEgldLabel();

  const [disabled, setDisabled] = useState<boolean>(timeLeft !== 0);
  const [counter, setCounter] = useState<number>(timeLeft);

  const getTimeLeft = (): string =>
    moment
      .utc(moment.duration(counter, 'seconds').asMilliseconds())
      .format('HH:mm:ss');

  const onWithdraw = async (): Promise<void> => {
    try {
      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };

      const payload = {
        args: '',
        chainId: new ChainID('T'),
        type: 'withdraw',
        value: '0'
      };

      await transact(parameters, payload);
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
          {value} {egldLabel}
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
