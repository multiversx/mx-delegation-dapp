import { useState, useEffect } from 'react';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetActiveTransactionsStatus } from '@multiversx/sdk-dapp/hooks/transactions/useGetActiveTransactionsStatus';
import axios from 'axios';
import classNames from 'classnames';
import moment from 'moment';

import { MultiversX } from 'assets/MultiversX';
import { network } from 'config';
import { UndelegateStakeListType } from 'context/state';
import useTransaction from 'helpers/useTransaction';

import styles from './styles.module.scss';

interface FormattersType {
  [key: string]: any;
  d: (string | number)[];
  h: (string | number)[];
  m: (string | number)[];
  s: (string | number)[];
}

export const Withdrawal = (props: UndelegateStakeListType) => {
  const { value, timeLeft } = props;
  const { pending } = useGetActiveTransactionsStatus();
  const { sendTransaction } = useTransaction();

  const [counter, setCounter] = useState<number>(timeLeft - moment().unix());
  const [fiat, setFiat] = useState('');

  const getTimeLeft = (): string => {
    const duration = moment.duration(counter, 'seconds');
    const formatters: FormattersType = {
      d: [duration.asDays(), Math.floor(duration.asDays())],
      h: [duration.asHours(), 'H'],
      m: [duration.asMinutes(), 'm'],
      s: [duration.asSeconds(), 's']
    };

    const format = Object.keys(formatters).reduce((total, key) => {
      const [time, label] = formatters[key];

      if (Math.floor(time) > 0) {
        return total === ''
          ? `${label}[${key}]`
          : `${total} : ${label}[${key}]`;
      }

      return total;
    }, '');

    return moment
      .utc(moment.duration(counter, 'seconds').asMilliseconds())
      .format(format);
  };

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

  const fetchFiat = () => {
    const source = axios.CancelToken.source();

    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${network.apiAddress}/economics`, {
          cancelToken: source.token
        });

        const amount = parseFloat(value.replace(',', '')) * data.price;

        setFiat(Number(amount.toFixed(2)).toLocaleString());
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
      }
    };

    fetchData();

    return () => {
      setFiat('');
      source.cancel();
    };
  };

  const handleCounter = () => {
    const interval = setInterval(() => setCounter((timer) => timer - 1), 1000);

    return () => {
      clearInterval(interval);
      setCounter(timeLeft - moment().unix());
    };
  };

  useEffect(handleCounter, []);
  useEffect(fetchFiat, []);

  return (
    <div className={`${styles.withdrawal} withdrawal`}>
      <div className={styles.left}>
        <span className={styles.icon}>
          <MultiversX />
        </span>

        <div className={styles.data}>
          <span className={styles.value}>
            {value} {network.egldLabel}
          </span>

          <span className={styles.amount}>${fiat}</span>
        </div>
      </div>
      <div className={styles.right}>
        {counter > 0 && (
          <div className={styles.time}>
            <span className={styles.date}>{getTimeLeft()}</span>
            <span className={styles.label}>Wait Time Left</span>
          </div>
        )}

        <button
          onClick={onWithdraw}
          className={classNames(styles.withdraw, {
            [styles.disabled]: counter > 0 || pending
          })}
        >
          <FontAwesomeIcon icon={faMinus} /> <span>Withdraw</span>
        </button>
      </div>

      {counter > 0 && (
        <div className={classNames(styles.time, styles.mobile)}>
          <span className={styles.date}>{getTimeLeft()}</span>
          <span className={styles.label}>Wait Time Left</span>
        </div>
      )}
    </div>
  );
};
