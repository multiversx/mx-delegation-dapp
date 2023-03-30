import React, { MouseEvent } from 'react';

import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account/useGetAccountInfo';
import { useGetActiveTransactionsStatus } from '@multiversx/sdk-dapp/hooks/transactions/useGetActiveTransactionsStatus';
import classNames from 'classnames';
import { Formik } from 'formik';
import { object } from 'yup';

import { Action, Submit } from 'components/Action';
import { delegateValidator } from 'components/Stake//helpers/delegationValidators';
import useStakeData, { ActionCallbackType } from 'components/Stake/hooks';
import { network } from 'config';

import { denominated } from 'helpers/denominate';

import styles from './styles.module.scss';

export const Delegate = () => {
  const { account } = useGetAccountInfo();
  const { onDelegate, getStakingLimits } = useStakeData();
  const { pending } = useGetActiveTransactionsStatus();
  const { limit, balance, maxed } = getStakingLimits();

  return (
    <div className={`${styles.wrapper} delegate-wrapper`}>
      <Action
        title='Delegate Now'
        description={`Select the amount of ${network.egldLabel} you want to delegate.`}
        disabled={pending}
        trigger={
          <div
            className={classNames(styles.trigger, {
              [styles.disabled]: pending
            })}
          >
            Delegate
          </div>
        }
        render={(onClose: ActionCallbackType) => (
          <div className={styles.delegate}>
            <Formik
              validationSchema={object().shape({
                amount: delegateValidator(balance, limit)
              })}
              onSubmit={onDelegate(onClose)}
              initialValues={{
                amount: '1'
              }}
            >
              {({
                errors,
                values,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue
              }) => {
                const onMax = (event: MouseEvent): void => {
                  event.preventDefault();
                  setFieldValue(
                    'amount',
                    denominated(limit, { addCommas: false })
                  );
                };

                return (
                  <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                      <label htmlFor='amount'>{network.egldLabel} Amount</label>
                      <div className={styles.group}>
                        <input
                          type='number'
                          name='amount'
                          step='any'
                          required={true}
                          autoComplete='off'
                          min={1}
                          value={values.amount}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          disabled={maxed}
                          className={classNames(styles.input, {
                            [styles.invalid]: errors.amount && touched.amount
                          })}
                        />

                        <a
                          href='/#'
                          onClick={onMax}
                          className={classNames(styles.max, {
                            [styles.disabled]: maxed
                          })}
                        >
                          Max
                        </a>
                      </div>

                      <span className={styles.description}>
                        <span>Balance:</span> {denominated(account.balance)}{' '}
                        {network.egldLabel}
                      </span>

                      {((errors.amount && touched.amount) || maxed) && (
                        <span className={styles.error}>
                          {maxed
                            ? 'Max delegation cap reached, staking unavailable.'
                            : errors.amount}
                        </span>
                      )}
                    </div>

                    <Submit
                      save='Continue'
                      onClose={() => {
                        setFieldValue('amount', '1');
                      }}
                    />
                  </form>
                );
              }}
            </Formik>
          </div>
        )}
      />
    </div>
  );
};
