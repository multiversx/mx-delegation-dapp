import * as React from 'react';

import { useDashboard } from 'pages/Dashboard/provider';
import { useApp } from 'provider';

import Identity from './components/Identity';
import Meta from './components/Meta';

const Heading: React.FC = () => {
  const { contractOwnerStatus } = useApp();
  const { setAdminEnabled, adminEnabled } = useDashboard();

  return (
    <div className='m-0 pt-4 mt-4 justify-content-between pl-4 pr-4 py4 card shadow-sm d-flex flex-row align-items-start'>
      <Meta />

      {contractOwnerStatus && (
        <div className='d-flex'>
          {adminEnabled && <Identity />}

          <button
            type='button'
            onClick={() => setAdminEnabled(!adminEnabled)}
            className='btn btn-primary mb-3'
          >
            {adminEnabled ? 'Dashboard' : 'Admin'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Heading;
