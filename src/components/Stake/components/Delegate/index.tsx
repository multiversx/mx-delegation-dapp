import React from 'react';

import { useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { Formik } from 'formik';
import { object } from 'yup';

import Action, { Submit } from '/src/components/Action';
import { delegateValidator } from '/src/components/Stake//helpers/delegationValidators';
import useStakeData from '/src/components/Stake/hooks';
import { network } from '/src/config';

import { denominated } from '/src/helpers/denominate';
import modifiable from '/src/helpers/modifiable';

import './styles.module.scss';

const Delegate: React.FC = () => {
  const { account } = useGetAccountInfo();
  const { onDelegate, getStakingLimits } = useStakeData();
  const { limit, balance } = getStakingLimits();

  return (
    <div className={styles.wrapper}>
      <Action
        title='Delegate Now'
        description={`Select the amount of ${network.egldLabel} you want to delegate.`}
        trigger={<div className={styles.trigger}>Delegate</div>}
        render={
          <div className={styles.delegate}>
            <Formik
              validationSchema={object().shape({
                amount: delegateValidator(balance, String(limit))
              })}
              onSubmit={onDelegate}
              initialValues={{
                amount: '0'
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
                const onMax = (event: any): void => {
                  event.preventDefault();
                  setFieldValue('amount', limit);
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
                          min={0}
                          className={modifiable(
                            'input',
                            [errors.amount && touched.amount && 'invalid'],
                            styles
                          )}
                          value={values.amount}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        />

                        <a href='/#' onClick={onMax} className={styles.max}>
                          Max
                        </a>
                      </div>

                      <span className={styles.description}>
                        <span>Balance:</span> {denominated(account.balance)}{' '}
                        {network.egldLabel}
                      </span>

                      {errors.amount && touched.amount && (
                        <span className={styles.error}>{errors.amount}</span>
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
