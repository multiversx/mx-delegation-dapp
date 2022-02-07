import * as React from 'react';
import { useState, useEffect } from 'react';

import { useFormikContext, FormikProps } from 'formik';
import moment from 'moment';
import { useDropzone } from 'react-dropzone';

import { network } from 'config';
import decodeFile from './helpers';

export interface DropzoneFormType {
  files: Array<any>;
}

export interface DropzonePayloadType {
  key: string;
  name: string;
  signature: string;
  pubKey: string;
  value: Array<Uint8Array>;
  errors?: Array<string>;
}

const Dropzone: React.FC = () => {
  const [data, setData] = useState<Array<DropzonePayloadType>>([]);
  const { setFieldValue, values }: FormikProps<DropzoneFormType> =
    useFormikContext();

  const dropzone = useDropzone({
    multiple: true,
    accept: '.pem',
    onDrop: async (files: any) => {
      const onload = (FileReader: any, name: string) => async () => {
        try {
          const decoded = await decodeFile(
            FileReader.result,
            network.delegationContract
          );

          const item = {
            ...decoded,
            name,
            key: `${name}-${moment().unix()}`
          };

          setData((items: any) => [...items, item]);
        } catch (error) {
          const item = {
            name,
            key: `${name}-${moment().unix()}`
          };

          console.error('Error decoding .pem:', error);
          setData((items: any) => [...items, item]);
          return;
        }
      };

      files.forEach((file: any) => {
        const fileReader = new FileReader();

        fileReader.onload = onload(fileReader, file.name);
        fileReader.readAsText(file);
      });
    }
  });

  const properties = {
    input: dropzone.getInputProps(),
    root: dropzone.getRootProps({
      className: 'dropzone border border-muted rounded rounded-lg',
      style: {
        cursor: 'pointer'
      }
    })
  };

  const onRemove = (key: string) => {
    const filter = (item: DropzonePayloadType) => item.key !== key;

    setData((current: Array<DropzonePayloadType>) => current.filter(filter));
    setFieldValue('files', values.files.filter(filter));
  };

  useEffect(() => {
    const value = data.map((file: DropzonePayloadType, fileIndex: number) => {
      const errors: Array<string> = [];
      const duplicate = (item: DropzonePayloadType, itemIndex: number) =>
        file.pubKey === item.pubKey && fileIndex > itemIndex;

      if (!file.pubKey || file.pubKey.length !== 192) {
        errors.push('length');
      }

      if (data.find(duplicate)) {
        errors.push('unique');
      }

      return {
        ...file,
        errors
      };
    });

    setFieldValue('files', value);

    return () => setFieldValue('files', []);
  }, [data]);

  return (
    <div {...properties.root}>
      <input {...properties.input} />

      <div className='dropzone-area text-center p-3'>
        {values.files.length > 0 ? (
          <div className='dropzone-area text-center has-file'>
            {values.files.map((file: DropzonePayloadType) => (
              <div
                key={file.key}
                className={`file border rounded m-1 ${
                  file.errors && file.errors.length > 0 ? 'border-danger' : ''
                } `}
              >
                <div className='d-flex justify-content-between align-items-center'>
                  <p className='ml-2 mb-0'>{file.name}</p>
                  <span
                    className='pr-2'
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onRemove(file.key);
                    }}
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      verticalAlign: '-0.1rem'
                    }}
                  >
                    <span aria-hidden='true'>×</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          'Drag and drop your PEM Files here, or Select Files'
        )}
      </div>
    </div>
  );
};

export default Dropzone;
