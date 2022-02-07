import * as React from 'react';
import { useState } from 'react';

import { getAccountProvider } from '@elrondnetwork/dapp-core';
import { ChainID } from '@elrondnetwork/erdjs';
import { Formik, FormikProps } from 'formik';
import { Modal } from 'react-bootstrap';
import { object, string } from 'yup';

import transact from 'helpers/transact';

import { useApp } from 'provider';

interface FieldType {
  [key: string]: any;
  label: string;
  name: string;
}

interface PayloadType {
  [key: string]: any;
  website?: string;
  keybase?: string;
  name?: string;
}

const Identity: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);
  const { agencyMetaData } = useApp();

  const fields: Array<FieldType> = [
    {
      name: 'name',
      label: 'Name'
    },
    {
      name: 'website',
      label: 'Website'
    },
    {
      name: 'keybase',
      label: 'Keybase'
    }
  ];

  // TODO
  // try {
  //   const validUrl = new URL(url);
  //   return !url.includes('#') && Boolean(validUrl);
  // } catch (e) {
  //   return false;
  // }

  const validation = object().shape({
    website: string()
      .required('Required')
      .test('URL', 'URL is not valid!', (value) =>
        value?.match(
          new RegExp(
            /^((?:http(?:s)?:\/\/)?[a-zA-Z0-9_-]+(?:.[a-zA-Z0-9_-]+)*.[a-zA-Z]{2,4}(?:\/[a-zA-Z0-9_]+)*(?:\/[a-zA-Z0-9_]+.[a-zA-Z]{2,4}(?:\?[a-zA-Z0-9_]+=[a-zA-Z0-9_]+)?)?(?:&[a-zA-Z0-9_]+=[a-zA-Z0-9_]+)*)$/
          )
        )
          ? true
          : false
      )
  });

  const onSubmit = async (payload: PayloadType): Promise<void> => {
    const { website, name, keybase }: PayloadType = Object.keys(payload).reduce(
      (data, key) => ({
        ...data,
        [key]: Buffer.from(payload[key]).toString('hex')
      }),
      {}
    );

    try {
      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };

      const data = {
        args: `${name}@${website}@${keybase}`,
        chainId: new ChainID('T'),
        type: 'setMetaData',
        value: '0'
      };

      await transact(parameters, data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='mr-3'>
      <button
        type='button'
        className='btn btn-primary mb-3'
        onClick={() => setShow(true)}
      >
        Identity
      </button>

      <Modal
        show={show}
        animation={false}
        centered={true}
        className='modal-container'
        onHide={() => setShow(false)}
      >
        <div className='p-4 text-center'>
          <h6 className='mb-spacer'>Agency Details</h6>

          <p className='mb-spacer'>
            Update or set your agency details in order to validate your
            identity.
          </p>

          <Formik
            validationSchema={validation}
            onSubmit={onSubmit}
            initialValues={agencyMetaData}
          >
            {({
              errors,
              values,
              touched,
              handleChange,
              handleBlur,
              handleSubmit
            }: FormikProps<PayloadType>) => (
              <form onSubmit={handleSubmit} className='text-left'>
                <div className='form-group mb-spacer'>
                  {fields.map((field: FieldType) => (
                    <div key={field.name} className='mb-3'>
                      <label htmlFor={field.name}>{field.label}</label>
                      <div className='input-group'>
                        <input
                          type='text'
                          className={`form-control ${
                            errors[field.name] &&
                            touched[field.name] &&
                            'is-invalid'
                          }`}
                          id={field.name}
                          name={field.name}
                          data-testid={field.name}
                          required={true}
                          value={values[field.name]}
                          autoComplete='off'
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />

                        {errors[field.name] && touched[field.name] && (
                          <span className='d-block text-danger'>
                            {errors[field.name]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
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
        </div>
      </Modal>
    </div>
  );
};

export default Identity;
