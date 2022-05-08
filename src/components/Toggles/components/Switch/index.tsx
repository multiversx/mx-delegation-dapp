import * as React from 'react';
import { useState, useEffect } from 'react';

import { useGlobalContext } from 'context';
import modifiable from 'helpers/modifiable';
import useTransaction from 'helpers/useTransaction';

import styles from './styles.module.scss';

interface ToggleType {
  transaction: string;
  name: string;
}

const Switch = ({ transaction, name }: ToggleType) => {
  const { contractDetails } = useGlobalContext();
  const { sendTransaction } = useTransaction();

  const [disabled, setDisabled] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(
    contractDetails.data ? contractDetails.data[name] === 'ON' : false
  );

  const onChange = (type: string): void => {
    setDisabled(true);
    setChecked(!checked);

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
      className={`${modifiable(
        'switch',
        [disabled && 'disabled'],
        styles
      )} switch`}
    >
      <input
        onChange={() => onChange(transaction)}
        type='checkbox'
        name={name}
        className={styles.input}
        defaultChecked={checked}
      />

      <span className={modifiable('slider', [checked && 'right'], styles)}>
        <span className={modifiable('label', [!checked && 'active'], styles)}>
          OFF
        </span>

        <span className={modifiable('label', [checked && 'active'], styles)}>
          ON
        </span>
      </span>
    </label>
  );
};

export default Switch;
