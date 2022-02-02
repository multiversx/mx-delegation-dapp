import * as React from 'react';
import { MouseEvent, useState } from 'react';

import {
  useGetAccountInfo,
  getEgldLabel,
  getNetworkProxy,
  getAccountProvider
} from '@elrondnetwork/dapp-core';
import { ChainID } from '@elrondnetwork/erdjs';
import BigNumber from 'bignumber.js';
import { Formik } from 'formik';
import { Modal } from 'react-bootstrap';
import { object, string } from 'yup';
import { nominateValToHex } from 'pages/Dashboard/helpers/nominate';
import transact from 'pages/Dashboard/helpers/transact';
import { useDashboard } from 'pages/Dashboard/provider';

import { useStaking } from '../../provider';

interface ActionType {
  mode: string;
}

interface ActionDataType {
  amount: string;
}

interface DataType {
  [key: string]: any;
  undelegate: {
    value: string;
    parameters: (value: string) => {
      value: string;
      type: string;
      args: string;
      chainId: any;
    };
  };
  delegate: {
    value: string;
    parameters: (value: string) => {
      value: string;
      type: string;
      args: string;
      chainId: any;
    };
  };
}

const Action: React.FC<ActionType> = ({ mode }) => {
  const [show, setShow] = useState<boolean>(false);

  const { denominated } = useDashboard();
  const { userStake, unstakeable } = useStaking();
  const { account } = useGetAccountInfo();

  const egldLabel = getEgldLabel();
  const data: DataType = {
    undelegate: {
      value: userStake,
      parameters: (value: string) => ({
        value: '0',
        type: 'unDelegate',
        chainId: new ChainID('T'),
        args: nominateValToHex(value)
      })
    },
    delegate: {
      value: denominated(account.balance),
      parameters: (value: string) => ({
        value,
        type: 'delegate',
        chainId: new ChainID('T'),
        args: ''
      })
    }
  };

  const onSubmit = async ({ amount }: ActionDataType): Promise<void> => {
    try {
      const config = await getNetworkProxy().getNetworkConfig();
      const { value, type, args } = data[mode].parameters(amount);

      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };

      const payload = {
        value,
        type,
        args,
        chainId: config.ChainID
      };

      await transact(parameters, payload);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button className='btn btn-primary mb-3' onClick={() => setShow(true)}>
        {mode}
      </button>

      <Modal
        show={show}
        animation={false}
        centered={true}
        className='modal-container'
        onHide={() => setShow(false)}
      >
        <div className='card card-body p-spacer'>
          <div className='text-center'>
            <p className='h6 mb-spacer'>{mode} now</p>

            <p className='mb-spacer'>
              {unstakeable.active && mode === 'delegate'
                ? 'The maximum delegation cap was reached you can not delegate more.'
                : `Select the amount of ${egldLabel} you want to ${mode}.`}
            </p>
          </div>

          {(!unstakeable.active || mode === 'undelegate') && (
            <Formik
              validationSchema={object().shape({
                amount: string()
                  .required('Required')
                  .test(
                    'minimum',
                    'Value must be greater than or equal to 1.',
                    (value) =>
                      new BigNumber(value || '').isGreaterThanOrEqualTo(1)
                  )
                  .test(
                    'maximum',
                    `You need to set a value under ${data[mode].value} ${egldLabel}.`,
                    (value) =>
                      new BigNumber(value || '').isLessThanOrEqualTo(
                        parseFloat(data[mode].value)
                      )
                  )
                  .test(
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
              })}
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
                  setFieldValue('amount', userStake);
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
                        Available: {data[mode].value} {egldLabel}
                      </span>

                      {errors.amount && touched.amount && (
                        <span className='d-block text-danger'>
                          {errors.amount}
                        </span>
                      )}
                    </div>

                    <div className='d-flex mt-3 justify-content-center align-items-center flex-wrap'>
                      <button className='btn btn-primary mx-2' type='submit'>
                        {mode}
                      </button>

                      <button
                        className='btn btn-link mx-2'
                        onClick={() => setShow(false)}
                      >
                        close
                      </button>
                    </div>
                  </form>
                );
              }}
            </Formik>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Action;
