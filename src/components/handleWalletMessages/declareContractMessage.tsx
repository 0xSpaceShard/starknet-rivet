import React, { useCallback, useState } from 'react';
import { useSharedState } from '../context/context';
import ConfirmationSection from '../confirmationSection/confirmationSection';
import { DeclareContractPayload } from 'starknet-6';

export const DeclareContractMessage: React.FC = () => {
  const context = useSharedState();

  const { selectedAccount } = context;

  const [declareContractData, setDeclareContractData] = useState<DeclareContractPayload | null>();

  const handleConfirm = useCallback(
    (message: any) => {
      if (!selectedAccount || !declareContractData) return;

      chrome.runtime.sendMessage({
        type: 'REQUEST_DECLARE_CONTRACT_RES',
        data: message,
      });

      setDeclareContractData(null);

      chrome.windows.getCurrent((window) => {
        if (window && window.id) {
          chrome.windows.remove(window.id);
        }
      });
    },
    [selectedAccount, declareContractData]
  );

  const handleDecline = useCallback(
    (message: any) => {
      if (selectedAccount) {
        chrome.runtime.sendMessage({
          type: 'REQUEST_DECLARE_CONTRACT_RES',
          data: { error: 'abort' },
        });
        setDeclareContractData(null);

        chrome.windows.getCurrent((window) => {
          if (window && window.id) {
            chrome.windows.remove(window.id);
          }
        });
      }
    },
    [selectedAccount]
  );

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'REQUEST_DECLARE_CONTRACT') {
      setDeclareContractData(message.data.payload);
    }
  });
  return (
    <>
      {declareContractData && (
        <ConfirmationSection
          title="Declare Contract Details"
          data={declareContractData.compiledClassHash}
          onConfirm={() => handleConfirm(declareContractData)}
          onDecline={() => handleDecline(declareContractData)}
        />
      )}
    </>
  );
};
