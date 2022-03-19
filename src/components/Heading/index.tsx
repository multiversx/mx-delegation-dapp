import * as React from 'react';

import {
  faExternalLinkAlt,
  faCog,
  faThLarge,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useLocation, useNavigate } from 'react-router-dom';
import Action from '/src/components/Action';
import { network } from '/src/config';
import { useGlobalContext } from '/src/context';

import Identity from './components/Identity';

import styles from './styles.module.scss';

const Heading: React.FC = () => {
  const { contractDetails } = useGlobalContext();

  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className={styles.heading}>
      <div className={styles.meta}>
        <div className={styles.label}>Contract Address</div>

        <div className='d-flex align-items-center'>
          <span className={styles.contract}>{network.delegationContract}</span>
          <a
            href={`https://explorer.elrond.com/accounts/${network.delegationContract}`}
            className={styles.icon}
            rel='noreferrer'
            target='_blank'
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </a>
        </div>
      </div>

      {contractDetails.data && contractDetails.data.owner && (
        <div className='d-flex align-items-center'>
          <button
            type='button'
            onClick={() => navigate(isAdmin ? '/dashboard' : '/admin')}
            className={styles.button}
          >
            <span className={styles.icon}>
              <FontAwesomeIcon icon={isAdmin ? faThLarge : faCog} />
            </span>

            {isAdmin ? 'Dashboard' : 'Admin'}
          </button>

          {isAdmin && (
            <Action
              title='Agency Details'
              description='Update or set your agency details in order to validate your identity.'
              trigger={
                <div className={styles.button}>
                  <span className={styles.icon}>
                    <FontAwesomeIcon icon={faEdit} />
                  </span>
                  Identity
                </div>
              }
              render={<Identity />}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Heading;
