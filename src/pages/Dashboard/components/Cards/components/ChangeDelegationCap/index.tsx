import * as React from 'react';

import BigNumber from 'bignumber.js';

import { Formik } from 'formik';
import { string, object } from 'yup';

import { network } from 'config';
import { useGlobalContext } from 'context';
import { denominated } from 'helpers/denominate';
import { nominateValToHex } from 'helpers/nominate';
import useTransaction from 'helpers/useTransaction';
import { useAction } from 'pages/Dashboard/components/Action/provider';

interface ActionDataType {
  amount: string;
}

const ChangeDelegationCap: React.FC = () => {
  const { sendTransaction } = useTransaction();
  const { totalActiveStake } = useGlobalContext();
  const { setShow } = useAction();

  const total = denominated(totalActiveStake.data || '', {
    addCommas: false
  });

  const validationSchema = object().shape({
    amount: string()
      .required('Required')
      .test(
        'minimum',
        `Minimum ${total} ${network.egldLabel} or 0 ${network.egldLabel}`,
        (amount) =>
          new BigNumber(amount || '').isGreaterThanOrEqualTo(total) ||
          amount === '0'
      )
  });

  const onSubmit = async ({ amount }: ActionDataType): Promise<void> => {
    try {
      await sendTransaction({
        args: nominateValToHex(amount.toString()),
        type: 'modifyTotalDelegationCap',
        value: '0'
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
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
        <form onSubmit={handleSubmit} className='text-left'>
          <div className='form-group mb-spacer'>
            <label htmlFor='amount'>Update Delegation Cap</label>

            <div className='input-group'>
              <input
                type='number'
                name='amount'
                step='any'
                required={true}
                autoComplete='off'
                min={0}
                className={`form-control ${
                  errors.amount && touched.amount && 'is-invalid'
                }`}
                value={values.amount}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </div>

            {errors.amount && touched.amount && (
              <span className='d-block text-danger'>{errors.amount}</span>
            )}
          </div>

          <div className='d-flex justify-content-center align-items-center flex-wrap'>
            <button type='submit' className='btn btn-primary mx-2'>
              Continue
            </button>

            <button
              type='button'
              onClick={() => setShow(false)}
              className='btn btn-link mx-2'
            >
              Close
            </button>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default ChangeDelegationCap;
