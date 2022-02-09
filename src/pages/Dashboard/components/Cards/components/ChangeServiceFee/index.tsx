import * as React from 'react';

import { Formik } from 'formik';
import { string, object } from 'yup';

import { nominateVal } from 'helpers/nominate';
import useTransaction from 'helpers/useTransaction';

import { useAction } from 'pages/Dashboard/components/Action/provider';

interface ActionDataType {
  amount: string;
}

const ChangeServiceFee: React.FC = () => {
  const { setShow } = useAction();
  const { sendTransaction } = useTransaction();

  const validationSchema = object().shape({
    amount: string()
      .required('Required')
      .test(
        'minimum',
        'Minimum fee percentage is 0.01',
        (amount) => parseFloat(amount || '') > 0
      )
      .test(
        'minimum',
        'Maximum fee percentage is 100',
        (amount) => parseFloat(amount || '') <= 100
      )
  });

  const onSubmit = async ({ amount }: ActionDataType): Promise<void> => {
    try {
      await sendTransaction({
        args: nominateVal(amount),
        type: 'changeServiceFee',
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
        amount: '0'
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
            <label htmlFor='amount'>Add the percentage fee</label>

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

            <small className='form-text'>For example: 12.30</small>

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

export default ChangeServiceFee;
