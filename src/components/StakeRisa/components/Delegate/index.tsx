import React, { useEffect, MouseEvent, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { Formik } from 'formik';
import { object, string } from 'yup';
import { nominate } from '@multiversx/sdk-dapp/utils/operations';
import { denominate } from '/src/helpers/denominate';

import Action, { Submit } from '/src/components/Action';
import { delegateValidator } from '/src/components/StakeRisa//helpers/delegationValidators';
import useStakeData from '/src/components/StakeRisa/hooks';
import { network } from '/src/config';

import modifiable from '/src/helpers/modifiable';

import * as styles './styles.module.scss';

const Delegate = () => {
  const { account } = useGetAccountInfo();
  const [balance, setBalance] = useState<string>('0');
  const { onStake, stakeSettings } = useStakeData();
  const isMaxDisabled =
    balance === '0' ||
    new BigNumber(balance)?.lt(stakeSettings?.min_stake_limit);
  const minimumStakeFormatted = denominate({
    input: stakeSettings?.min_stake_limit.toFixed()
  });

  const loadBalance = () => {
    async function fetchData() {
      const res = await fetch(
        `${network.apiAddress}/accounts/${account.address}/tokens?identifier=${network.risaTokenId}`
      ).then((res) => res.json());
      setBalance(res?.[0].balance);
    }
    fetchData();
  };

  useEffect(loadBalance, []);

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
                amount: string()
                  .required('Amount is required.')
                  .test(
                    'minimum',
                    'Value must be greater than zero.',
                    (value = '0') =>
                      new BigNumber(nominate(value, 18)).isGreaterThanOrEqualTo(
                        1
                      )
                  )
                  .test(
                    'minimum',
                    `Minimum stake is ${minimumStakeFormatted} RISA.`,
                    (value = '0') =>
                      new BigNumber(nominate(value, 18)).isGreaterThanOrEqualTo(
                        stakeSettings?.min_stake_limit
                      )
                  )
                  .test(
                    'maximum',
                    `Maximum stake is ${denominate({
                      input: balance, decimals: 0
                    })} RISA.`,
                    (value) => new BigNumber(nominate(value || '0', 18)).lte(balance)
                       
                  )
              })}
              onSubmit={onStake}
              initialValues={{
                amount: ''
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
                    denominate({
                      input: balance,
                      decimals: 0,
                      addCommas: false
                    })
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
                            [isMaxDisabled && 'disabled'],
                            styles
                          )}
                        >
                          Max
                        </a>
                      </div>

                      <span className={styles.description}>
                        <span>Minimum Stake:</span> {minimumStakeFormatted} RISA
                      </span>

                      <span className={styles.description}>
                        <span>Balance:</span>{' '}
                        {denominate({ input: balance || '0' })} RISA
                      </span>

                      {errors.amount && touched.amount && (
                        <span className={styles.error}>{errors.amount}</span>
                      )}
                    </div>

                    <Submit disabled={errors.amount && touched.amount} save='Continue' />
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
