import React, { FC, ChangeEvent, MouseEvent, useState } from 'react';

import { Formik } from 'formik';
import { object } from 'yup';
import Action, { Submit } from '/src/components/Action';
import { undelegateValidator } from '/src/components/StakeRisa//helpers/delegationValidators';
import useStakeData from '/src/components/StakeRisa/hooks';
import { network } from '/src/config';
import { useGlobalContext } from '/src/context';

import { denominate } from '/src/helpers/denominate';

import modifiable from '/src/helpers/modifiable';
import styles from './styles.module.scss';

const Undelegate = (props: { disabled: boolean }) => {
  const { userActiveRisaStake } = useGlobalContext();
  const { onUnstake } = useStakeData();
  const [maxed, setMaxed] = useState<boolean>(false);

  return (
    <div className={`${styles.wrapper} undelegate-wrapper`}>
      <Action
        title='Unstake RISA'
        description={`Select the percentage to unstake.`}
        trigger={<div className={`${styles.trigger} ${props.disabled && styles.disabled}`}>Unstake</div>}
        disabled={props.disabled}
        render={
          <div className={styles.undelegate}>
            <Formik
              validationSchema={object().shape({
                amount: undelegateValidator(userActiveRisaStake.data || '')
              })}
              onSubmit={onUnstake}
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
                const onChange = (
                  event: ChangeEvent<HTMLInputElement>
                ): void => {
                  handleChange(event);
                  setMaxed(false);
                };

                const onMax = (event: MouseEvent): void => {
                  event.preventDefault();
                  setMaxed(true);
                  setFieldValue('amount', 100);
                };

                return (
                  <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                      <label htmlFor='amount'>Percent</label>
                      <div className={styles.group}>
                        <input
                          type='number'
                          step='1'
                          pattern='\d+'
                          name='amount'
                          required={true}
                          autoComplete='off'
                          min={0}
                          max={100}
                          className={modifiable(
                            'input',
                            [errors.amount && touched.amount && 'invalid'],
                            styles
                          )}
                          value={maxed ? 100 : values.amount}
                          onBlur={handleBlur}
                          onChange={onChange}
                        />

                        <a href='/#' onClick={onMax} className={styles.max}>
                          Max
                        </a>
                      </div>

                      <span className={styles.description}>
                        <span className={styles.description}>
                          <span>Balance:</span>{' '}
                          {userActiveRisaStake.data || '0'} RISA
                        </span>
                        <br />
                        <span>Unstake:</span>{' '}
                        {values.amount ? `${values.amount} %` : ''}
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
