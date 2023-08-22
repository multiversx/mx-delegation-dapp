import classNames from 'classnames';
import { Modal } from 'react-bootstrap';

import { useAction, withAction } from './context';

import styles from './styles.module.scss';

export const Action = withAction(
  ({ render, title, description, trigger, disabled }: any) => {
    const { showModal, setShowModal } = useAction();

    return (
      <div className={classNames(styles.action, 'action')}>
        <button
          onClick={() => setShowModal(true)}
          className={classNames(styles.trigger, {
            [styles.disabled]: disabled
          })}
        >
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
            {render && (
              <div className={styles.render}>
                {render(() => setShowModal(false))}
              </div>
            )}
          </div>
        </Modal>
      </div>
    );
  }
);

export const Submit = ({ close, submit, onClose }: any) => {
  const { setShowModal } = useAction();

  const onCloseClick = (event: any) => {
    if (onClose) {
      onClose();
    }

    event.preventDefault();
    setShowModal(false);
  };

  return (
    <div className={styles.buttons}>
      <button type='button' className={styles.button} onClick={onCloseClick}>
        {close || 'Close'}
      </button>

      <button type='submit' className={classNames(styles.button, styles.blue)}>
        {submit || 'Submit'}
      </button>
    </div>
  );
};
