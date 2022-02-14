import { useEffect } from 'react';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { address } = useGetAccountInfo();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(Boolean(address) ? '/dashboard' : '/unlock');
  }, [address]);

  return null;
};

export default Home;
