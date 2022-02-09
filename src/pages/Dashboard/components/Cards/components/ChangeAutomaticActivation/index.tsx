import * as React from 'react';
import { Fragment } from 'react';

import { useGlobalContext } from 'context';
import useTransaction from 'helpers/useTransaction';
import { useAction } from 'pages/Dashboard/components/Action/provider';

const ChangeAutomaticActivation: React.FC = () => {
  const { sendTransaction } = useTransaction();
  const { contractDetails } = useGlobalContext();
  const { setShow } = useAction();

  const onSubmit = async (): Promise<void> => {
    if (contractDetails.data) {
      try {
        const status =
          contractDetails.data.automaticActivation === 'ON' ? 'false' : 'true';

        await sendTransaction({
          args: Buffer.from(status).toString('hex'),
          type: 'setAutomaticActivation',
          value: '0'
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Fragment>
      <p className='lead mb-spacer'>
        {contractDetails.data
          ? contractDetails.data.automaticActivation
          : '...'}
      </p>

      <div className='d-flex justify-content-center align-items-center flex-wrap'>
        <button
          type='button'
          onClick={onSubmit}
          className='btn btn-primary mx-2'
        >
          {contractDetails.data
            ? `Turn ${
                contractDetails.data.automaticActivation === 'ON' ? 'OFF' : 'ON'
              }`
            : '...'}
        </button>

        <button
          type='button'
          onClick={() => setShow(false)}
          className='btn btn-link mx-2'
        >
          Close
        </button>
      </div>
    </Fragment>
  );
};

export default ChangeAutomaticActivation;
