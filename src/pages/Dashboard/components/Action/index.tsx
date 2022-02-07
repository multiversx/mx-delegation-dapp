import * as React from 'react';
import { Fragment } from 'react';
import { Modal } from 'react-bootstrap';

import { withAction, useAction } from './provider';

const Action: React.FC = ({ render, title, description, trigger }: any) => {
  const { show, setShow } = useAction();

  return (
    <Fragment>
      <button className='btn btn-primary mb-3' onClick={() => setShow(true)}>
        {trigger}
      </button>

      <Modal
        show={show}
        animation={false}
        centered={true}
        className='modal-container'
        onHide={() => setShow(false)}
      >
        <div className='p-4 text-center'>
          {title && <h6 className='mb-spacer'>{title}</h6>}

          {description && <p className='mb-spacer'>{description}</p>}

          {render}
        </div>
      </Modal>
    </Fragment>
  );
};

export default withAction(Action);
