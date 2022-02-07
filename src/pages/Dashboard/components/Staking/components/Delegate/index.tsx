import * as React from 'react';
import { MouseEvent } from 'react';

import {
  useGetAccountInfo,
  getEgldLabel,
  getAccountProvider
} from '@elrondnetwork/dapp-core';
import BigNumber from 'bignumber.js';
import { Formik } from 'formik';
import { object } from 'yup';
import { denominated } from 'helpers/denominate';
import transact from 'helpers/transact';
import { useAction } from 'pages/Dashboard/components/Action/provider';
import { useApp } from 'provider';

import { handleValidation } from '../../helpers/handleValidation'; // TODO: use absolute imports
import { useStaking } from '../../provider';

interface ActionDataType {
  amount: string;
}

const Delegate: React.FC = () => {
  const { account } = useGetAccountInfo();
  const { networkConfig } = useApp();
  const { unstakeable } = useStaking();
  const { setShow } = useAction();

  const egldLabel = getEgldLabel();
  const validation = object().shape({
    amount: handleValidation(denominated(account.balance)).test(
      'uncapable',
      'Max delegation cap reached. That is the maximum amount you can delegate.',
      (value) => {
        if (Number.isNaN(parseFloat(unstakeable.available))) {
          return true;
        }

        return (
          unstakeable.exceeds &&
          new BigNumber(value || '').isLessThanOrEqualTo(
            parseFloat(unstakeable.available)
          )
        );
      }
    )
  });

  const onSubmit = async ({ amount }: ActionDataType): Promise<void> => {
    try {
      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };

      const payload = {
        value: amount,
        type: 'delegate',
        chainId: networkConfig.ChainID,
        args: ''
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
          setFieldValue('amount', denominated(account.balance));
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
                Available: {denominated(account.balance)} {egldLabel}
              </span>

              {errors.amount && touched.amount && (
                <span className='d-block text-danger'>{errors.amount}</span>
              )}
            </div>

            <div className='d-flex mt-3 justify-content-center align-items-center flex-wrap'>
              <button className='btn btn-primary mx-2' type='submit'>
                Delegate
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

export default Delegate;
