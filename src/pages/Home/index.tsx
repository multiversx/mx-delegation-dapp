import { useEffect } from 'react';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { address } = useGetAccountInfo();
  const navigate = useNavigate();
  const handleRedirect = () => {
    navigate(Boolean(address) ? '/dashboard' : '/unlock');
  };

  useEffect(handleRedirect, [address]);

  return null;
};

export default Home;
