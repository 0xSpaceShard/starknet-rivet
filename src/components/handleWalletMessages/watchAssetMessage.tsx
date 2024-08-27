import React, { useCallback, useState } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useSharedState } from '../context/context';
import { useAccountContracts } from '../hooks/useAccountContracts';
import ConfirmationSection from '../confirmationSection/confirmationSection';

export const WatchAssetMessage: React.FC = () => {
  const context = useSharedState();

  const { selectedAccount } = context;
  const { data: accountContracts, update: updateAccountContracts } = useAccountContracts();

  const [newAddress, setNewAddress] = useState('');

  const handleConfirm = useCallback(async () => {
    console.log('START');
    if (!newAddress?.trim() || !selectedAccount?.address) return;

    const messageType = 'WATCH_ASSET_HANDLER_RES';

    const contracts = accountContracts?.get(selectedAccount.address) || [];
    if (!contracts.includes(newAddress)) {
      contracts.push(newAddress);
      accountContracts?.set(selectedAccount.address, contracts);
      await updateAccountContracts(accountContracts);
    }

    setNewAddress('');
    chrome.runtime.sendMessage({
      type: messageType,
      data: true,
    });

    chrome.windows.getCurrent((window) => {
      if (window && window.id) {
        chrome.windows.remove(window.id);
      }
    });
  }, [newAddress, selectedAccount, accountContracts]);

  const handleDecline = useCallback(() => {
    if (selectedAccount) {
      const messageType = 'WATCH_ASSET_HANDLER_RES';

      chrome.runtime.sendMessage({
        type: messageType,
        data: false,
      });
      setNewAddress('');

      chrome.windows.getCurrent((window) => {
        if (window && window.id) {
          chrome.windows.remove(window.id);
        }
      });
    }
  }, [selectedAccount]);

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'WATCH_ASSET_HANDLER') {
      setNewAddress(message.data.options.address);
    }
  });

  return (
    <>
      <ConfirmationSection
        title="Add New Token"
        data={newAddress}
        onConfirm={handleConfirm}
        onDecline={handleDecline}
      />
    </>
  );
};
