import { ChangeEvent, MouseEvent, useState } from 'react';
import { useGetActiveTransactionsStatus } from '@multiversx/sdk-dapp/hooks/transactions/useGetActiveTransactionsStatus';
import classNames from 'classnames';
import { Formik } from 'formik';
import { object } from 'yup';

import { Action, Submit } from 'components/Action';
import { undelegateValidator } from 'components/Stake//helpers/delegationValidators';
import useStakeData, { ActionCallbackType } from 'components/Stake/hooks';
import { network } from 'config';
import { useGlobalContext } from 'context';
import { denominated } from 'helpers/denominate';

import styles from './styles.module.scss';

export const Undelegate = () => {
  const [maxed, setMaxed] = useState(false);

  const { userActiveStake } = useGlobalContext();
  const { onUndelegate } = useStakeData();
  const { pending } = useGetActiveTransactionsStatus();

  return (
    <div className={classNames(styles.wrapper, 'undelegate-wrapper')}>
      <Action
        title='Undelegate Now'
        description={`Select the amount of ${network.egldLabel} you want to undelegate.`}
        disabled={pending}
        trigger={
          <div
            className={classNames(styles.trigger, {
              [styles.disabled]: pending
            })}
          >
            Undelegate
          </div>
        }
        render={(callback: ActionCallbackType) => (
          <div className={styles.undelegate}>
            <Formik
              validationSchema={object().shape({
                amount: undelegateValidator(userActiveStake.data || '')
              })}
              onSubmit={onUndelegate(callback)}
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
                const amount = denominated(userActiveStake.data || '', {
                  addCommas: false,
                  showLastNonZeroDecimal: true
                });

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
                          value={maxed ? amount : values.amount}
                          onBlur={handleBlur}
                          onChange={onChange}
                          className={classNames(styles.input, {
                            [styles.invalid]: errors.amount && touched.amount
                          })}
                        />

                        <a href='/#' onClick={onMax} className={styles.max}>
                          Max
                        </a>
                      </div>

                      <span className={styles.description}>
                        <span>Balance:</span>{' '}
                        {denominated(userActiveStake.data || '')}{' '}
                        {network.egldLabel}
                      </span>

                      {errors.amount && touched.amount && (
                        <span className={styles.error}>{errors.amount}</span>
                      )}
                    </div>

                    <Submit
                      save='Continue'
                      onClose={() => {
                        setMaxed(false);
                        setFieldValue('amount', '0');
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
