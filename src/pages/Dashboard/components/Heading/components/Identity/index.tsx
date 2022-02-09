import * as React from 'react';
import { useState, useEffect } from 'react';

import {
  ContractFunction,
  ProxyProvider,
  Address,
  Query,
  decodeString
} from '@elrondnetwork/erdjs';
import { Formik, FormikProps } from 'formik';
import { Modal } from 'react-bootstrap';
import { object, string } from 'yup';
import { network } from 'config';

import { useDispatch, useGlobalContext } from 'context';
import useTransaction from 'helpers/useTransaction';

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
  const { agencyMetaData } = useGlobalContext();
  const { sendTransaction } = useTransaction();

  const dispatch = useDispatch();
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

  const validationSchema = object().shape({
    website: string()
      .required('Required')
      .test('URL', 'URL is not valid!', (value: any) => {
        try {
          return value && !value.includes('#') && Boolean(new URL(value || ''));
        } catch (error) {
          return false;
        }
      })
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
      await sendTransaction({
        args: `${name}@${website}@${keybase}`,
        type: 'setMetaData',
        value: '0'
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getAgencyMetaData = async (): Promise<void> => {
    dispatch({
      type: 'getAgencyMetaData',
      agencyMetaData: {
        status: 'loading',
        data: null,
        error: null
      }
    });

    try {
      const provider = new ProxyProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getMetaData')
      });

      const data = await provider.queryContract(query);
      const [name, website, keybase] = data.outputUntyped().map(decodeString);

      dispatch({
        type: 'getAgencyMetaData',
        agencyMetaData: {
          status: 'loaded',
          error: null,
          data: {
            name,
            website,
            keybase
          }
        }
      });
    } catch (error) {
      dispatch({
        type: 'getAgencyMetaData',
        agencyMetaData: {
          status: 'error',
          data: null,
          error
        }
      });
    }
  };

  useEffect(() => {
    if (!agencyMetaData.data) {
      getAgencyMetaData();
    }
  }, [agencyMetaData.data]);

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
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            initialValues={
              agencyMetaData.data || { name: '', website: '', keybase: '' }
            }
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
