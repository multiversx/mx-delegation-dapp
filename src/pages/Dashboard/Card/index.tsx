import { useState } from 'react';
import * as React from 'react';

import { Formik } from 'formik';
import { Modal } from 'react-bootstrap';
import { useDashboard } from '../provider';

export interface CardType {
  label: string;
  data: {
    value: string;
    percentage?: string;
    modal?: {
      title: string;
      button: string;
      description: string;
      status?: string;
      onSubmit: (value?: any) => void;
      input?: {
        defaultValue: string;
        validation: any;
        description: string;
        label: string;
      };
    };
  };
}

const Card: React.FC<CardType> = ({ label, data }) => {
  const [show, setShow] = useState<boolean>(false);
  const { adminEnabled } = useDashboard();

  return (
    <div
      key={label}
      style={{ flexGrow: 1, width: '20%' }}
      className='card p-4 m-0 grow'
    >
      <span>{label}</span>

      <span className='mt-3'>{data.value}</span>

      {data.percentage && <span className='mt-3'>{data.percentage}</span>}

      {adminEnabled && data.modal && (
        <div className='position-absolute mr-4' style={{ right: '0' }}>
          <button
            className='btn btn-primary mb-3'
            onClick={() => setShow(true)}
          >
            Change
          </button>

          <Modal
            show={show}
            animation={false}
            centered={true}
            className='modal-container'
            onHide={() => setShow(false)}
          >
            <div className='p-4 text-center'>
              <h6 className='mb-spacer'>{data.modal.title}</h6>

              <p className='mb-spacer'>{data.modal.description}</p>

              {data.modal.status && (
                <p className='lead mb-spacer'>{data.modal.status}</p>
              )}

              {data.modal.status && (
                <div className='d-flex justify-content-center align-items-center flex-wrap'>
                  <button
                    type='button'
                    onClick={data.modal.onSubmit}
                    className='btn btn-primary mx-2'
                  >
                    {data.modal.button}
                  </button>

                  <button
                    type='button'
                    onClick={() => setShow(false)}
                    className='btn btn-link mx-2'
                  >
                    Close
                  </button>
                </div>
              )}

              {data.modal && data.modal.input && (
                <Formik
                  validationSchema={data.modal.input.validation}
                  onSubmit={data.modal.onSubmit}
                  initialValues={{
                    amount: data.modal.input.defaultValue || '0'
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
                        {data.modal && (
                          <label htmlFor='amount'>
                            {data.modal.input?.label}
                          </label>
                        )}

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

                        {data.modal && data.modal.input?.description && (
                          <small className='form-text'>
                            For example: 12.30
                          </small>
                        )}

                        {errors.amount && touched.amount && (
                          <span className='d-block text-danger'>
                            {errors.amount}
                          </span>
                        )}
                      </div>

                      <div className='d-flex justify-content-center align-items-center flex-wrap'>
                        {data.modal && (
                          <button
                            type='submit'
                            className='btn btn-primary mx-2'
                          >
                            {data.modal.button}
                          </button>
                        )}

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
              )}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default Card;
