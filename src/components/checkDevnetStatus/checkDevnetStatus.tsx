import React, { useState, useEffect } from 'react';
import { useSharedState } from '../context/context';
import './checkDevnetStatus.css';

const CheckDevnetStatus: React.FC<{ url: string }> = ({ url }) => {
  const [isAlive, setIsAlive] = useState(false);
  const { setUrlList } = useSharedState();

  const updateIsAliveStatus = (url: string, isAlive: boolean) => {
    setUrlList((prevList) =>
      prevList.map((item) =>
        item.url === url ? { ...item, isAlive: isAlive } : item
      )
    );
  };

  useEffect(() => {
    const checkDevnetStatus = async () => {
      try {
        await fetch(`http://${url}/is_alive`);
        updateIsAliveStatus(url, true)
        setIsAlive(true)
      } catch (error) {
        updateIsAliveStatus(url, false)
        setIsAlive(false)
        console.error("Error checking devnet status:", error);
      }
    };

    checkDevnetStatus();

    const interval = setInterval(checkDevnetStatus, 60000);
    return () => clearInterval(interval);
  }, [url]);

  return <span className={isAlive ? 'green-light' : 'red-light'}></span>;
};

export default CheckDevnetStatus;