import { useEffect } from 'react';
import {
  ContractFunction,
  Address,
  Query,
  decodeString
} from '@multiversx/sdk-core';
import { useGetSuccessfulTransactions } from '@multiversx/sdk-dapp/hooks/transactions/useGetSuccessfulTransactions';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import classNames from 'classnames';
import { Formik, FormikProps } from 'formik';
import { object, string } from 'yup';

import { Submit } from 'components/Action';
import { network } from 'config';
import { useDispatch, useGlobalContext } from 'context';
import useTransaction from 'helpers/useTransaction';

import styles from './styles.module.scss';

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

export const Identity = () => {
  const { agencyMetaData } = useGlobalContext();
  const { sendTransaction } = useTransaction();
  const { hasSuccessfulTransactions, successfulTransactionsArray } =
    useGetSuccessfulTransactions();

  const dispatch = useDispatch();
  const fields: FieldType[] = [
    { name: 'name', label: 'Name' },
    { name: 'website', label: 'Website' },
    { name: 'keybase', label: 'Keybase' }
  ];

  const validationSchema = object().shape({
    name: string().required('Name required.'),
    keybase: string().required('Keybase required.'),
    website: string()
      .required('Website required.')
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
      const provider = new ProxyNetworkProvider(network.gatewayAddress);
      const query = new Query({
        address: new Address(network.delegationContract),
        func: new ContractFunction('getMetaData')
      });

      const data = await provider.queryContract(query);
      const [name, website, keybase] = data
        .getReturnDataParts()
        .map(decodeString);

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

  const fetchAgencyMetaData = () => {
    if (!agencyMetaData.data) {
      getAgencyMetaData();
    }
  };

  const refetchAgencyMetaData = () => {
    if (
      hasSuccessfulTransactions &&
      agencyMetaData.data &&
      successfulTransactionsArray.length > 0
    ) {
      getAgencyMetaData();
    }
  };

  useEffect(fetchAgencyMetaData, [agencyMetaData.data]);
  useEffect(refetchAgencyMetaData, [
    hasSuccessfulTransactions,
    successfulTransactionsArray.length
  ]);

  const initialValues: PayloadType = { name: '', website: '', keybase: '' };

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
      initialValues={agencyMetaData.data || initialValues}
    >
      {({
        errors,
        values,
        touched,
        handleChange,
        handleBlur,
        handleSubmit
      }: FormikProps<PayloadType>) => (
        <form onSubmit={handleSubmit} className={`${styles.identity} identity`}>
          {fields.map((field: FieldType) => (
            <div key={field.name} className={styles.field}>
              <label htmlFor={field.name}>{field.label}</label>
              <div className='input-group'>
                <input
                  type='text'
                  name={field.name}
                  value={values[field.name]}
                  autoComplete='off'
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={classNames(styles.input, {
                    [styles.invalid]: errors[field.name] && touched[field.name]
                  })}
                />

                {errors[field.name] && touched[field.name] && (
                  <span className={styles.error}>
                    <>{errors[field.name]}</>
                  </span>
                )}
              </div>
            </div>
          ))}

          <Submit close='Cancel' submit='Save' />
        </form>
      )}
    </Formik>
  );
};
