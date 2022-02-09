import * as React from 'react';

import { useGlobalContext } from 'context';

import Identity from './components/Identity';
import Meta from './components/Meta';

const Heading: React.FC = () => {
  const { contractDetails, adminView, setAdminView } = useGlobalContext();

  return (
    <div className='m-0 pt-4 mt-4 justify-content-between pl-4 pr-4 py4 card shadow-sm d-flex flex-row align-items-start'>
      <Meta />

      {contractDetails.data && contractDetails.data.owner && (
        <div className='d-flex'>
          {adminView && <Identity />}

          <button
            type='button'
            onClick={() => setAdminView(!adminView)}
            className='btn btn-primary mb-3'
          >
            {adminView ? 'Dashboard' : 'Admin'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Heading;
