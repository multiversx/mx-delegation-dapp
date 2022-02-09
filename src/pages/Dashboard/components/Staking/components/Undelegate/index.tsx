import * as React from 'react';
import { MouseEvent } from 'react';

import { Formik } from 'formik';
import { object } from 'yup';

import { network } from 'config';
import { useGlobalContext } from 'context';
import { nominateValToHex } from 'helpers/nominate';
import useTransaction from 'helpers/useTransaction';
import { useAction } from 'pages/Dashboard/components/Action/provider';
import { handleValidation } from 'pages/Dashboard/components/Staking/helpers/handleValidation';

interface ActionDataType {
  amount: string;
}

const Undelegate: React.FC = () => {
  const { sendTransaction } = useTransaction();
  const { userActiveStake } = useGlobalContext();
  const { setShow } = useAction();

  const validationSchema = object().shape({
    amount: handleValidation(userActiveStake.data || '')
  });

  const onSubmit = async ({ amount }: ActionDataType): Promise<void> => {
    try {
      await sendTransaction({
        value: '0',
        type: 'unDelegate',
        args: nominateValToHex(amount.toString())
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
        const onMax = (event: MouseEvent): void => {
          event.preventDefault();
          setFieldValue('amount', userActiveStake.data);
        };

        return (
          <form onSubmit={handleSubmit} className='text-left'>
            <div className='form-group mb-spacer'>
              <label htmlFor='amount'>Amount {network.egldLabel}</label>
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
                <span className='input-group-append'>
                  <a
                    href='/#'
                    onClick={onMax}
                    className='input-group-text text-dark'
                  >
                    Max
                  </a>
                </span>
              </div>
              <span>
                Available: {userActiveStake.data} {network.egldLabel}
              </span>

              {errors.amount && touched.amount && (
                <span className='d-block text-danger'>{errors.amount}</span>
              )}
            </div>

            <div className='d-flex mt-3 justify-content-center align-items-center flex-wrap'>
              <button className='btn btn-primary mx-2' type='submit'>
                Undelegate
              </button>

              <button
                className='btn btn-link mx-2'
                onClick={() => setShow(false)}
              >
                Close
              </button>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export default Undelegate;
