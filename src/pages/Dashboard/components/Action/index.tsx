import * as React from 'react';
import { useState } from 'react';

import { Modal } from 'react-bootstrap';

import modifiable from 'helpers/modifiable';

import styles from './styles.module.scss';

const Action = ({ render, title, description, trigger, buttons = {} }: any) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <div className={styles.action}>
      <button className={styles.trigger} onClick={() => setShow(true)}>
        {trigger}
      </button>

      <Modal
        show={show}
        animation={false}
        centered={true}
        className='modal-container'
        onHide={() => setShow(false)}
      >
        <div className={styles.modal}>
          {title && <div className={styles.title}>{title}</div>}

          {description && <p className={styles.description}>{description}</p>}

          {render && (
            <div className={styles.render}>
              {render}

              <div className={styles.buttons}>
                <button
                  type='button'
                  className={styles.button}
                  onClick={() => setShow(false)}
                >
                  {buttons.clse || 'Close'}
                </button>

                <button
                  type='submit'
                  className={modifiable('button', ['blue'], styles)}
                >
                  {buttons.submit || 'Submit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Action;
