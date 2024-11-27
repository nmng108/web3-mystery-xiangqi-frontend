import { useContext } from 'react';
import { GlobalContext } from '../context';

const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  return context;
};

export default useGlobalContext;
