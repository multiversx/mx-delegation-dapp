import React, { FC, MouseEvent } from 'react';

import { useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { Formik } from 'formik';
import { object } from 'yup';

import Action, { Submit } from '/src/components/Action';
import { delegateValidator } from '/src/components/Stake//helpers/delegationValidators';
import useStakeData from '/src/components/Stake/hooks';
import { network } from '/src/config';

import modifiable from '/src/helpers/modifiable';

import styles from './styles.module.scss';

const Delegate: FC = () => {
  const { account } = useGetAccountInfo();
  const { onDelegate, getStakingLimits } = useStakeData();
  const { limit, balance, maxed } = getStakingLimits();

  return (
    <div className={`${styles.wrapper} delegate-wrapper`}>
      <Action
        title='Stake Now'
        description={`Select the amount of ${network.egldLabel} you want to stake.`}
        trigger={<div className={styles.trigger}>Stake Now</div>}
        render={
          <div className={styles.delegate}>
            <Formik
              validationSchema={object().shape({
                amount: delegateValidator(balance, limit)
              })}
              onSubmit={onDelegate}
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
                    denominate({ input: limit, addCommas: false })
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
                          className={modifiable(
                            'input',
                            [errors.amount && touched.amount && 'invalid'],
                            styles
                          )}
                          value={values.amount}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          disabled={maxed}
                        />

                        <a
                          href='/#'
                          onClick={onMax}
                          className={modifiable(
                            'max',
                            [maxed && 'disabled'],
                            styles
                          )}
                        >
                          Max
                        </a>
                      </div>

                      <span className={styles.description}>
                        <span>Balance:</span> {denominate({ input: account.balance || '0' })}{' '}
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

                    <Submit save='Continue' />
                  </form>
                );
              }}
            </Formik>
          </div>
        }
      />
    </div>
  );
};

export default Delegate;
