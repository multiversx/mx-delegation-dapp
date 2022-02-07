import * as React from 'react';

import { getAccountProvider, getEgldLabel } from '@elrondnetwork/dapp-core';
import { ChainID } from '@elrondnetwork/erdjs';
import BigNumber from 'bignumber.js';

import { Formik } from 'formik';
import { string, object } from 'yup';

import { denominated } from 'helpers/denominate';
import { nominateValToHex } from 'helpers/nominate';
import transact from 'helpers/transact';
import { useAction } from 'pages/Dashboard/components/Action/provider';

import { useApp } from 'provider';

interface ActionDataType {
  amount: string;
}

const ChangeDelegationCap: React.FC = () => {
  const { totalActiveStake } = useApp();
  const { setShow } = useAction();

  const egldLabel = getEgldLabel();
  const total = denominated(totalActiveStake, {
    addCommas: false
  });

  // TODO: rename to validationSchema
  const validation = object().shape({
    amount: string()
      .required('Required')
      .test(
        'minimum',
        `Minimum ${total} ${egldLabel} or 0 ${egldLabel}`,
        (amount) =>
          new BigNumber(amount || '').isGreaterThanOrEqualTo(total) ||
          amount === '0'
      )
  });

  const onSubmit = async ({ amount }: ActionDataType): Promise<void> => {
    try {
      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };
      const payload = {
        args: nominateValToHex(amount.toString()),
        chainId: new ChainID('T'),
        type: 'modifyTotalDelegationCap',
        value: '0'
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
