import React, { useState, useEffect, useCallback } from 'react';
import { useSharedState } from '../context/context';
import './checkDevnetStatus.css';
import { sendMessageToUpdateUrlList } from '../utils/sendMessageBackground';

const CheckDevnetStatus: React.FC<{ url: string }> = ({ url }) => {
  const [isAlive, setIsAlive] = useState(false);
  const { setUrlList } = useSharedState();

  useEffect(() => {
    const checkDevnetStatus = async () => {
      try {
        await fetch(`${url}/is_alive`);
        updateIsAliveStatus(true);
        setIsAlive(true);
      } catch (error) {
        updateIsAliveStatus(false);
        setIsAlive(false);
        console.error('Error checking devnet status:', error);
      }
    };

    checkDevnetStatus();

    const interval = setInterval(checkDevnetStatus, 60000);
    return () => clearInterval(interval);
  }, [url]);

  const updateIsAliveStatus = useCallback(
    (newIsAlive: boolean) => {
      sendMessageToUpdateUrlList(url, newIsAlive, setUrlList);
    },
    [url]
  );

  return <span className={isAlive ? 'green-light' : 'red-light'}></span>;
};

export default CheckDevnetStatus;
