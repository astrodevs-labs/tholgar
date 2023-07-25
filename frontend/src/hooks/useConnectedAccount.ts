import { useStore } from '../store';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function useConnectedAccount(): {
  address: `0x${string}` | undefined;
  isConnecting: boolean;
  isConnected: boolean;
} {
  const { address, isConnecting, isConnected } = useStore((state) => ({
    address: state.address,
    isConnecting: state.isConnecting,
    isConnected: state.isConnected
  }));
  const {
    address: newAddress,
    isConnecting: newIsConnecting,
    isConnected: newIsConnected
  } = useAccount();
  const { setAddress, setIsConnecting, setIsConnected } = useStore((state) => ({
    setAddress: state.setAddress,
    setIsConnecting: state.setIsConnecting,
    setIsConnected: state.setIsConnected
  }));

  useEffect(() => {
    if (address !== newAddress) setAddress(newAddress);
    if (isConnecting !== newIsConnecting) setIsConnecting(newIsConnecting);
    if (isConnected !== newIsConnected) setIsConnected(newIsConnected);
  }, []);

  return { address, isConnecting, isConnected };
}
