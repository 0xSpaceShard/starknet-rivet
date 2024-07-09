import React, { useState, useEffect, useCallback } from 'react';
import { useSharedState } from '../context/context';
import './checkDevnetStatus.css';
import { sendMessageToUpdateUrlList } from '../utils/sendMessageBackground';
import { Typography } from '@mui/material';

const CheckDevnetStatus: React.FC<{
  url: string;
  shouldSendMessage?: boolean;
  initialIsAlive?: boolean;
}> = ({ url, shouldSendMessage = true, initialIsAlive = false }) => {
  const [isAlive, setIsAlive] = useState(initialIsAlive);
  const { setUrlList } = useSharedState();

  const updateIsAliveStatus = useCallback(
    (newIsAlive: boolean) => {
      sendMessageToUpdateUrlList(url, newIsAlive, setUrlList);
    },
    [url]
  );

  useEffect(() => {
    if (!url) return;

    const checkDevnetStatus = async () => {
      try {
        await fetch(`${url}/is_alive`);
        if (shouldSendMessage) {
          updateIsAliveStatus(true);
        }
        setIsAlive(true);
      } catch (error) {
        if (shouldSendMessage) {
          updateIsAliveStatus(false);
        }
        setIsAlive(false);
        console.error('Error checking devnet status:', error);
      }
    };

    checkDevnetStatus();

    const interval = setInterval(checkDevnetStatus, 60000);
    return () => clearInterval(interval);
  }, [url]);

  return <Typography className={isAlive ? 'green-light' : 'red-light'} />;
};

export default CheckDevnetStatus;
