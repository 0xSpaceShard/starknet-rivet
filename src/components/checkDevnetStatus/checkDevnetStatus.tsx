import React, { useState, useEffect, useCallback } from 'react';
import { Typography } from '@mui/material';
import { useSharedState } from '../context/context';

import './checkDevnetStatus.css';
import { logError } from '../../background/analytics';

const CheckDevnetStatus: React.FC<{
  url: string;
  shouldSendMessage?: boolean;
  initialIsAlive?: boolean;
}> = ({ url, shouldSendMessage = true, initialIsAlive = false }) => {
  const [isAlive, setIsAlive] = useState(initialIsAlive);
  const { urlList, updateUrlList } = useSharedState();

  const updateIsAliveStatus = useCallback(
    (newIsAlive: boolean) => {
      const updatedList = urlList.map((item) =>
        item.url === url ? { ...item, newIsAlive } : item
      );
      updateUrlList(updatedList);
    },
    [url]
  );

  useEffect(() => {
    if (!url) return;

    const checkDevnetStatus = async () => {
      try {
        const currentIsAlive = await fetch(`${url}/is_alive`);
        if (!currentIsAlive.ok) throw new Error('Devnet is not alive');

        if (shouldSendMessage) {
          updateIsAliveStatus(true);
        }
        setIsAlive(true);
      } catch (error) {
        if (shouldSendMessage) {
          updateIsAliveStatus(false);
        }
        setIsAlive(false);
        logError('Error checking devnet status:', error);
      }
    };

    checkDevnetStatus();

    const interval = setInterval(checkDevnetStatus, 60000);
    // eslint-disable-next-line consistent-return
    return () => clearInterval(interval);
  }, [url]);

  return <Typography className={isAlive ? 'green-light' : 'red-light'} />;
};

export default CheckDevnetStatus;
