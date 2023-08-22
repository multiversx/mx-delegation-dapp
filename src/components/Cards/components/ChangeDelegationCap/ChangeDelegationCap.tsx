import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import { Formik } from 'formik';
import { string, object } from 'yup';

import { Submit } from 'components/Action';
import { network } from 'config';
import { useGlobalContext } from 'context';
import { denominated } from 'helpers/denominate';
import { nominateValToHex } from 'helpers/nominate';
import useTransaction from 'helpers/useTransaction';

import styles from './styles.module.scss';

interface ActionDataType {
  amount: string;
}

export const ChangeDelegationCap = () => {
  const { sendTransaction } = useTransaction();
  const { contractDetails, totalActiveStake } = useGlobalContext();

  const minimum = denominated(totalActiveStake.data || '', {
    addCommas: false
  });

  const total = denominated(
    contractDetails.data ? contractDetails.data.delegationCap : '',
    {
      addCommas: false
    }
  );

  const validationSchema = object().shape({
    amount: string()
      .required('Required')
      .test(
        'minimum',
        `Minimum ${minimum} ${network.egldLabel} or 0 ${network.egldLabel}`,
        (value = '') =>
          new BigNumber(value).isGreaterThanOrEqualTo(minimum) || value === '0'
      )
  });

  const onSubmit = async (data: ActionDataType): Promise<void> => {
    try {
      await sendTransaction({
        args: nominateValToHex(data.amount.toString()),
        type: 'modifyTotalDelegationCap',
        value: '0'
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`${styles.cap} cap`}>
      <Formik
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        initialValues={{
          amount: total
        }}
      >
        {({
          errors,
          values,
          touched,
          handleChange,
          handleBlur,
          handleSubmit
        }) => (
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor='amount'>Update Delegation Cap</label>

              <div className={styles.group}>
                <input
                  type='number'
                  name='amount'
                  step='any'
                  required={true}
                  autoComplete='off'
                  min={0}
                  value={values.amount}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  className={classNames(styles.input, {
                    [styles.invalid]: errors.amount && touched.amount
                  })}
                />
              </div>

              {errors.amount && touched.amount && (
                <span className={styles.error}>{errors.amount}</span>
              )}
            </div>

            <Submit close='Cancel' submit='Continue' />
          </form>
        )}
      </Formik>
    </div>
  );
};
