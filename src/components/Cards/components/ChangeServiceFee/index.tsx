import React, { FC } from 'react';

import { Formik } from 'formik';
import { Submit } from 'components/Action';

import { useGlobalContext } from 'context';
import modifiable from 'helpers/modifiable';
import { nominateVal } from 'helpers/nominate';
import useTransaction from 'helpers/useTransaction';

import styles from './styles.module.scss';

interface ActionDataType {
  amount: string;
}

const ChangeServiceFee: FC = () => {
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
      {({ values, handleChange, handleBlur, handleSubmit }) => {
        const breakpoints = [0, 25, 50, 75, 100];

        return (
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
              ></div>

              {breakpoints.map((breakpoint) => (
                <div
                  key={`breakpoint-${breakpoint}`}
                  className={modifiable(
                    'breakpoint',
                    [breakpoint <= parseInt(values.amount) && 'completed'],
                    styles
                  )}
                  style={{ left: `${breakpoint}%` }}
                >
                  <span>{breakpoint}%</span>
                </div>
              ))}
            </div>

            <Submit close='Cancel' submit='Save' />
          </form>
        );
      }}
    </Formik>
  );
};

export default ChangeServiceFee;
