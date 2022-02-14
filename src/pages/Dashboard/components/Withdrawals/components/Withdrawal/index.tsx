import * as React from 'react';
import { useState, useEffect } from 'react';

import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

import moment from 'moment';
import Logo from 'assets/Logo';
import { network } from 'config';
import { UndelegateStakeListType } from 'context/state';
import modifiable from 'helpers/modifiable';
import useTransaction from 'helpers/useTransaction';

import styles from './styles.module.scss';

interface FormattersType {
  [key: string]: any;
  d: Array<string | number>;
  h: Array<string | number>;
  m: Array<string | number>;
  s: Array<string | number>;
}

const Withdrawal: React.FC<UndelegateStakeListType> = ({ value, timeLeft }) => {
  const [counter, setCounter] = useState<number>(timeLeft);
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

  const fetchFiat = () => {
    const fetchData = async () => {
      const pairs = await axios.get('https://api.elrond.com/mex-pairs');
      const token = pairs.data.find(
        (item: any) => item.baseId === 'WEGLD-bd4d79'
      );

      setFiat((parseFloat(value) * token.basePrice).toFixed(2));
    };

    fetchData();
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

  useEffect(() => {
    if (counter > 0) {
      setTimeout(() => setCounter(counter - 1), 1000);
    }
  }, [counter]);

  useEffect(() => setCounter(timeLeft), []);
  useEffect(fetchFiat, []);

  return (
    <div className={styles.withdrawal}>
      <div className={styles.left}>
        <span className={styles.icon}>
          <Logo />
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
          <FontAwesomeIcon icon={faMinus} /> Withdraw
        </button>
      </div>
    </div>
  );
};

export default Withdrawal;
