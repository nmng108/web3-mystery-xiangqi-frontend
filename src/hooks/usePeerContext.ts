import { useContext } from 'react';
import { PeerContext } from '../context';

const usePeerContext = () => useContext(PeerContext);

export default usePeerContext;
