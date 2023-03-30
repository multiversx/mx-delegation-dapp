import React from 'react';

import classNames from 'classnames';
import { Formik } from 'formik';
import { Submit } from 'components/Action';

import { useGlobalContext } from 'context';
import { nominateVal } from 'helpers/nominate';
import useTransaction from 'helpers/useTransaction';

import styles from './styles.module.scss';

interface ActionDataType {
  amount: string;
}

export const ChangeServiceFee = () => {
  const breakpoints = [0, 25, 50, 75, 100];

  const { sendTransaction } = useTransaction();
  const { contractDetails } = useGlobalContext();

  const onSubmit = async (data: ActionDataType): Promise<void> => {
    try {
      await sendTransaction({
        args: nominateVal(data.amount),
        type: 'changeServiceFee',
        value: '0'
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={{
        amount: contractDetails.data
          ? contractDetails.data.serviceFee.replace('%', '')
          : '0'
      }}
    >
      {({ values, handleChange, handleBlur, handleSubmit }) => (
        <form
          onSubmit={handleSubmit}
          className={`${styles.serviceFee} serviceFee`}
        >
          <div className={styles.range}>
            <input
              className={styles.input}
              name='amount'
              type='range'
              onBlur={handleBlur}
              onChange={handleChange}
              min={0}
              max={100}
              value={values.amount}
            />

            <span
              className={styles.thumb}
              style={{ left: `${values.amount}%` }}
            >
              <strong>{values.amount}%</strong>
            </span>

            <div
              className={styles.completion}
              style={{ width: `${values.amount}%` }}
            />

            {breakpoints.map((breakpoint) => (
              <div
                style={{ left: `${breakpoint}%` }}
                key={`breakpoint-${breakpoint}`}
                className={classNames(styles.breakpoint, {
                  [styles.completed]: breakpoint <= parseInt(values.amount)
                })}
              >
                <span>{breakpoint}%</span>
              </div>
            ))}
          </div>

          <Submit close='Cancel' submit='Save' />
        </form>
      )}
    </Formik>
  );
};
