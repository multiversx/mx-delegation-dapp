import { Modal } from 'react-bootstrap';
import modifiable from '/src/helpers/modifiable';
import { useAction, withAction } from './context';

import styles from './styles.module.scss';

const Action = ({ render, title, description, trigger, disabled }: any) => {
  const { showModal, setShowModal } = useAction();

  return (
    <div className={`${styles.action} action`}>
      <button className={`${styles.trigger}  ${disabled && styles.disabled}`} disabled={disabled} onClick={() => setShowModal(true)}>
        {trigger}
      </button>

      <Modal
        show={showModal}
        animation={false}
        centered={true}
        className='modal-container'
        onHide={() => setShowModal(false)}
      >
        <div className={styles.modal}>
          {title && <div className={styles.title}>{title}</div>}

          {description && <p className={styles.description}>{description}</p>}

          {render && <div className={styles.render}>{render}</div>}
        </div>
      </Modal>
    </div>
  );
};

export const Submit = ({ close, submit, disabled }: any) => {
  const { setShowModal } = useAction();

  return (
    <div className={styles.buttons}>
      <button
        type='button'
        className={styles.button}
        onClick={() => setShowModal(false)}
      >
        {close || 'Close'}
      </button>

      <button type='submit' className={modifiable('button', ['blue', disabled && 'disabled'], styles)} disabled={disabled}>
        {submit || 'Submit'}
      </button>
    </div>
  );
};

export default withAction(Action);
