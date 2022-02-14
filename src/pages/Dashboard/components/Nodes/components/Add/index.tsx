import * as React from 'react';

import { Formik } from 'formik';
import { object, array, mixed } from 'yup';

import modifiable from 'helpers/modifiable';
import useTransaction from 'helpers/useTransaction';

import Dropzone, {
  DropzonePayloadType,
  DropzoneFormType
} from 'pages/Dashboard/components/Nodes/components/Dropzone';

import styles from './styles.module.scss';

const Add: React.FC = () => {
  const { sendTransaction } = useTransaction();

  const validationSchema = object().shape({
    files: array()
      .of(mixed())
      .test('validKeyLength', 'Invalid PEM file.', (value: any) =>
        value.every(
          (file: DropzonePayloadType) =>
            file.errors && !file.errors.includes('length')
        )
      )
      .test('keyIsUnique', 'Duplicate key detected!', (value: any) =>
        value.every(
          (file: DropzonePayloadType) =>
            file.errors && !file.errors.includes('unique')
        )
      )
      .required('PEM file is required.')
  });

  const onSubmit = async ({ files }: DropzoneFormType): Promise<void> => {
    try {
      const value = files.reduce(
        (total: string, current: DropzonePayloadType) =>
          `${total}@${current.pubKey}@${current.signature}`,
        ''
      );

      await sendTransaction({
        args: value,
        type: 'addNodes',
        value: '0'
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Formik
      initialValues={{ files: [] }}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, errors }) => (
        <form onSubmit={handleSubmit} className={styles.add}>
          <Dropzone />

          {errors.files && <div className={styles.error}>{errors.files}</div>}
        </form>
      )}
    </Formik>
  );
};

export default Add;
