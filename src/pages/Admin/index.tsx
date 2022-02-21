import React from 'react';

import Cards from 'components/Cards';
import Heading from 'components/Heading';
import Nodes from 'components/Nodes';
import Toggles from 'components/Toggles';

import useGlobalData from '../../hooks/useGlobalData';

import styles from './styles.module.scss';

const Admin: React.FC = () => {
  useGlobalData();

  return (
    <div className={styles.admin}>
      <Heading />

      <Cards />

      <Toggles />

      <Nodes />
    </div>
  );
};

export default Admin;
