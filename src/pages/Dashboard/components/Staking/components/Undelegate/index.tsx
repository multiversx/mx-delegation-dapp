import * as React from 'react';
import { MouseEvent } from 'react';

import { getEgldLabel, getAccountProvider } from '@elrondnetwork/dapp-core';
import { ChainID } from '@elrondnetwork/erdjs';
import { Formik } from 'formik';
import { object } from 'yup';
import { nominateValToHex } from 'helpers/nominate';
import transact from 'helpers/transact';
import { useAction } from 'pages/Dashboard/components/Action/provider';
import { useApp } from 'provider';
import { handleValidation } from '../../helpers/handleValidation';

interface ActionDataType {
  amount: string;
}

const Undelegate: React.FC = () => {
  const { userActiveStake } = useApp();
  const { setShow } = useAction();

  const egldLabel = getEgldLabel();
  const validation = object().shape({
    amount: handleValidation(userActiveStake)
  });

  const onSubmit = async ({ amount }: ActionDataType): Promise<void> => {
    try {
      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };

      const payload = {
        value: '0',
        type: 'unDelegate',
        chainId: new ChainID('T'),
        args: nominateValToHex(amount.toString())
      };

      await transact(parameters, payload);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Formik
      validationSchema={validation}
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
          setFieldValue('amount', userActiveStake);
        };

        return (
          <form onSubmit={handleSubmit} className='text-left'>
            <div className='form-group mb-spacer'>
              <label htmlFor='amount'>Amount {egldLabel}</label>
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
                Available: {userActiveStake} {egldLabel}
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
