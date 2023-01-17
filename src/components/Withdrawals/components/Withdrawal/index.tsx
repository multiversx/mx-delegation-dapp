import React, { useState, FC, useEffect } from 'react';

import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

import moment from 'moment';
import XLogo from '/src/assets/XLogo';
import { network } from '/src/config';
import { UndelegateStakeListType } from '/src/context/state';
import modifiable from '/src/helpers/modifiable';
import useTransaction from '/src/helpers/useTransaction';

import styles from './styles.module.scss';

interface FormattersType {
  [key: string]: any;
  d: Array<string | number>;
  h: Array<string | number>;
  m: Array<string | number>;
  s: Array<string | number>;
}

const Withdrawal = (
  {
    value,
    timeLeft
  }: UndelegateStakeListType
) => {
  const [counter, setCounter] = useState<number>(timeLeft - moment().unix());
  const [fiat, setFiat] = useState<string>('');
  const { sendTransaction } = useTransaction();

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
        const pairs = await axios.get('https://api.elrond.com/mex-pairs', {
          cancelToken: source.token
        });

        const token = pairs.data.find(
          (item: any) => item.baseId === 'WEGLD-bd4d79'
        );

        const amount = parseFloat(value.replace(',', '')) * token.basePrice;

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
          <XLogo />
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
          className={modifiable(
            'withdraw',
            [counter > 0 && 'disabled'],
            styles
          )}
        >
          <FontAwesomeIcon icon={faMinus} /> <span>Withdraw</span>
        </button>
      </div>

      {counter > 0 && (
        <div className={modifiable('time', ['mobile'], styles)}>
          <span className={styles.date}>{getTimeLeft()}</span>
          <span className={styles.label}>Wait Time Left</span>
        </div>
      )}
    </div>
  );
};

export default Withdrawal;
