import { useState, useEffect } from 'react';
import { useGetActiveTransactionsStatus } from '@multiversx/sdk-dapp/hooks/transactions/useGetActiveTransactionsStatus';
import classNames from 'classnames';

import { useGlobalContext } from 'context';
import useTransaction from 'helpers/useTransaction';

import styles from './styles.module.scss';

export interface SwitchPropsType {
  transaction: string;
  name: string;
}

export const Switch = (props: SwitchPropsType) => {
  const { transaction, name } = props;
  const { contractDetails } = useGlobalContext();
  const { sendTransaction } = useTransaction();
  const { pending } = useGetActiveTransactionsStatus();

  const [disabled, setDisabled] = useState(false);
  const [checked, setChecked] = useState(
    contractDetails.data ? contractDetails.data[name] === 'ON' : false
  );

  const onChange = (type: string): void => {
    setDisabled(true);

    try {
      setTimeout(async (): Promise<void> => {
        await sendTransaction({
          args: Buffer.from(`${!checked}`).toString('hex'),
          value: '0',
          type
        });

        setDisabled(false);
      }, 200);
    } catch (error) {
      console.error(error);
    }
  };

  const trackContractDetails = () => {
    if (contractDetails.data) {
      setChecked(contractDetails.data[name] === 'ON');
    }
  };

  useEffect(trackContractDetails, [contractDetails.data]);

  return (
    <label
      className={classNames(
        styles.switch,
        { [styles.disabled]: disabled || pending },
        'switch'
      )}
    >
      <input
        onChange={() => onChange(transaction)}
        type='checkbox'
        name={name}
        className={styles.input}
        defaultChecked={checked}
      />

      <span
        className={classNames(styles.slider, {
          [styles.right]: checked,
          [styles.disabled]: pending
        })}
      >
        {['OFF', 'ON'].map((toggle) => (
          <span
            key={toggle}
            className={classNames(styles.label, { [styles.active]: checked })}
          >
            {toggle}
          </span>
        ))}
      </span>
    </label>
  );
};
