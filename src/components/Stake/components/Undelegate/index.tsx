import React, { FC, ChangeEvent, MouseEvent, useState } from 'react';

import { Formik } from 'formik';
import { object } from 'yup';
import Action, { Submit } from '/src/components/Action';
import { undelegateValidator } from '/src/components/Stake//helpers/delegationValidators';
import useStakeData from '/src/components/Stake/hooks';
import { network } from '/src/config';
import { useGlobalContext } from '/src/context';

import { denominate } from '/src/helpers/denominate'

import modifiable from '/src/helpers/modifiable';
import * as styles './styles.module.scss';

const Undelegate = () => {
  const { userActiveStake } = useGlobalContext();
  const { onUndelegate } = useStakeData();
  const [maxed, setMaxed] = useState<boolean>(false);

  return (
    <div className={`${styles.wrapper} undelegate-wrapper`}>
      <Action
        title='Unstake Now'
        description={`Select the amount of ${network.egldLabel} you want to unstake.`}
        trigger={<div className={styles.trigger}>Unstake</div>}
        render={
          <div className={styles.undelegate}>
            <Formik
              validationSchema={object().shape({
                amount: undelegateValidator(userActiveStake.data || '')
              })}
              onSubmit={onUndelegate}
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
                const amount = denominate({
                  input: userActiveStake.data || '',
                  addCommas: false,
                  showLastNonZeroDecimal: true
                })

                const onChange = (
                  event: ChangeEvent<HTMLInputElement>
                ): void => {
                  handleChange(event);
                  setMaxed(false);
                };

                const onMax = (event: MouseEvent): void => {
                  event.preventDefault();
                  setMaxed(true);
                  setFieldValue('amount', amount);
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
                          value={maxed ? amount : values.amount}
                          onBlur={handleBlur}
                          onChange={onChange}
                        />

                        <a href='/#' onClick={onMax} className={styles.max}>
                          Max
                        </a>
                      </div>

                      <span className={styles.description}>
                        <span>Balance:</span>{' '}
                        {denominate({
                          input: userActiveStake.data || '0'
                        })}{' '}
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

export default Undelegate;
