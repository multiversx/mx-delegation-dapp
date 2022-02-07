import { useState } from 'react';

// TODO: moves to context

const useClient = () => {
  const [adminEnabled, setAdminEnabled] = useState<boolean>(false);

  return {
    adminEnabled,
    setAdminEnabled
  };
};

export default useClient;
