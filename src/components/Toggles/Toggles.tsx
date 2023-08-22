import { faRecycle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

import { Switch } from './components/Switch';

import styles from './styles.module.scss';

export interface ToggleType {
  label: string;
  name: string;
  transaction: string;
  color: string;
}

export const Toggles = () => {
  const toggles: ToggleType[] = [
    {
      label: 'Automatic Activation',
      name: 'automaticActivation',
      transaction: 'setAutomaticActivation',
      color: '#2BA874'
    },
    {
      label: 'Redelegation Cap',
      name: 'redelegationCap',
      transaction: 'setReDelegateCapActivation',
      color: '#D9715B'
    }
  ];

  return (
    <div className={classNames(styles.toggles, 'toggles')}>
      {toggles.map((toggle) => (
        <div key={toggle.name} className={styles.toggle}>
          <div className={styles.left}>
            <div
              className={styles.icon}
              style={{ backgroundColor: toggle.color }}
            >
              <FontAwesomeIcon icon={faRecycle} />
            </div>

            <span className={styles.label}>{toggle.label}</span>
          </div>

          <div className={styles.right}>
            <Switch {...toggle} />
          </div>
        </div>
      ))}
    </div>
  );
};
