import { useState, useEffect } from 'react';
import { getAccountProvider, getEgldLabel } from '@elrondnetwork/dapp-core';

import { ChainID } from '@elrondnetwork/erdjs';

import transact from 'pages/Dashboard/helpers/transact';
import moment from 'moment';

import * as React from 'react';

interface WithdrawalType {
  value: string;
  timeLeft: number;
}

const Withdrawal: React.FC<WithdrawalType> = ({ value, timeLeft }) => {
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
      setTimeout(() => setCounter((counter) => counter - 1), 1000);
    } else {
      setDisabled(false);
    }
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
