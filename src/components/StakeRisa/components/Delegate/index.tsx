import React, { FC, MouseEvent } from 'react';

import { useGetAccountInfo } from '@elrondnetwork/dapp-core/hooks';
import { Formik } from 'formik';
import { object } from 'yup';
import { denominate } from '/src/helpers/denominate';

import Action, { Submit } from '/src/components/Action';
import { delegateValidator } from '/src/components/StakeRisa//helpers/delegationValidators';
import useStakeData from '/src/components/StakeRisa/hooks';
import { network } from '/src/config';

import modifiable from '/src/helpers/modifiable';

import styles from './styles.module.scss';

const Delegate: FC = () => {
  const { account } = useGetAccountInfo();
  const { onDelegate } = useStakeData();

  return (
    <div className={`${styles.wrapper} delegate-wrapper`}>
      <Action
        title='Stake RISA'
        description={`Select the amount of RISA you want to stake.`}
        trigger={<div className={styles.trigger}>Stake RISA</div>}
        render={
          <div className={styles.delegate}>
            <Formik
              validationSchema={object().shape({
                amount: delegateValidator(1)
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
                    denominate({ input: 342, addCommas: false })
                  );
                };

                return (
                  <form onSubmit={handleSubmit}>
                    <div className={styles.field}>
                      <label htmlFor='amount'>RISA Amount</label>
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
                          disabled={false}
                        />

                        <a
                          href='/#'
                          onClick={onMax}
                          className={modifiable(
                            'max',
                            ['disabled'],
                            styles
                          )}
                        >
                          Max
                        </a>
                      </div>

                      <span className={styles.description}>
                        <span>Balance:</span>{' '}
                        {denominate({ input: account.balance || '0' })}{' '}
                        RISA
                      </span>

                      {((errors.amount && touched.amount))}
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
