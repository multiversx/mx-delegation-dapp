import { useState } from 'react';

const useClient = () => {
  const [show, setShow] = useState<boolean>(false);

  return {
    show,
    setShow
  };
};

export default useClient;
