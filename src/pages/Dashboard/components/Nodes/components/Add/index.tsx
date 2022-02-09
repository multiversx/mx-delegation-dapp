import * as React from 'react';
import { useState } from 'react';

import { Formik } from 'formik';
import { Modal } from 'react-bootstrap';
import { object, array, mixed } from 'yup';

import useTransaction from 'helpers/useTransaction';

import Dropzone, {
  DropzonePayloadType,
  DropzoneFormType
} from 'pages/Dashboard/components/Nodes/components/Dropzone';

const Add: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);
  const { sendTransaction } = useTransaction();

  const validationSchema = object().shape({
    files: array()
      .of(mixed())
      .test('validKeyLength', 'Invalid PEM file', (value: any) =>
        value.every(
          (file: DropzonePayloadType) =>
            file.errors && !file.errors.includes('length')
        )
      )
      .test('keyIsUnique', 'Duplicate key detected', (value: any) =>
        value.every(
          (file: DropzonePayloadType) =>
            file.errors && !file.errors.includes('unique')
        )
      )
      .required('PEM file is required')
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
    <div>
      <button
        type='button'
        className='btn btn-primary'
        onClick={() => setShow(true)}
      >
        Add Nodes
      </button>

      <Modal
        show={show}
        animation={false}
        centered={true}
        className='modal-container'
        onHide={() => setShow(false)}
      >
        <div className='card'>
          <div className='card-body p-spacer text-center'>
            <p className='h6 mb-0' data-testid='delegateTitle'>
              Add Nodes
            </p>
            <div className='mt-spacer'>
              <Formik
                initialValues={{ files: [] }}
                onSubmit={onSubmit}
                validationSchema={validationSchema}
              >
                {({ handleSubmit, errors }) => (
                  <form onSubmit={handleSubmit}>
                    <Dropzone />

                    {errors.files && (
                      <span className='d-block text-danger'>
                        {errors.files}
                      </span>
                    )}

                    <div className='d-flex align-items-center justify-content-center flex-wrap mt-spacer'>
                      <button type='submit' className='btn btn-primary mx-2'>
                        Add Nodes
                      </button>

                      <button
                        className='btn btn-link mx-2'
                        onClick={() => setShow(false)}
                        type='button'
                      >
                        Close
                      </button>
                    </div>
                  </form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Add;
