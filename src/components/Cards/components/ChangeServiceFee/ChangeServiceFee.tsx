import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { Formik } from 'formik';

import { Submit } from 'components/Action';
import { useGlobalContext } from 'context';
import { nominateVal } from 'helpers/nominate';
import useTransaction from 'helpers/useTransaction';

import {
  onAmountInputChange,
  onAmountRangeChange,
  onBreakpointClick
} from './helpers';
import styles from './styles.module.scss';

export interface ActionDataType {
  amountRange: string;
  amountInput: number;
}

export const ChangeServiceFee = () => {
  const breakpoints = [0, 25, 50, 75, 100];

  const { sendTransaction } = useTransaction();
  const { contractDetails } = useGlobalContext();

  const onSubmit = async (data: ActionDataType): Promise<void> => {
    try {
      await sendTransaction({
        args: nominateVal(data.amountRange),
        type: 'changeServiceFee',
        value: '0'
      });
    } catch (error) {
      console.error(error);
    }
  };

  const initialServiceFee = contractDetails.data
    ? contractDetails.data.serviceFee.replace('%', '')
    : '0';

  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={{
        amountInput: Number(initialServiceFee),
        amountRange: initialServiceFee
      }}
    >
      {({ values, handleBlur, handleSubmit, setFieldValue }) => (
        <form
          onSubmit={handleSubmit}
          className={`${styles.serviceFee} serviceFee`}
        >
          <div className={styles.range}>
            <input
              className={styles.input}
              name='amountRange'
              type='range'
              onBlur={handleBlur}
              onInput={onAmountRangeChange(setFieldValue)}
              min={0}
              max={100}
              value={values.amountRange}
              step={0.01}
            />

            <span
              className={styles.thumb}
              style={{ left: `${values.amountRange}%` }}
            >
              <strong>{values.amountRange}%</strong>
            </span>

            <div
              className={styles.completion}
              style={{ width: `${values.amountRange}%` }}
            />

            {breakpoints.map((breakpoint) => (
              <div
                style={{ left: `${breakpoint}%` }}
                key={`breakpoint-${breakpoint}`}
                onClick={onBreakpointClick(breakpoint, setFieldValue)}
                className={classNames(styles.breakpoint, {
                  [styles.matching]: new BigNumber(breakpoint).isEqualTo(
                    values.amountRange
                  ),
                  [styles.completed]: new BigNumber(
                    breakpoint
                  ).isLessThanOrEqualTo(values.amountRange)
                })}
              >
                <span>{breakpoint}%</span>
              </div>
            ))}
          </div>

          <div className={styles.field}>
            <div className={styles.group}>
              <input
                type='text'
                name='amountInput'
                autoComplete='off'
                value={values.amountInput}
                min={0}
                max={100}
                onInput={onAmountInputChange(setFieldValue)}
                onBlur={handleBlur}
                step={0.01}
                className={styles.input}
              />
            </div>
          </div>

          <Submit close='Cancel' submit='Save' />
        </form>
      )}
    </Formik>
  );
};
