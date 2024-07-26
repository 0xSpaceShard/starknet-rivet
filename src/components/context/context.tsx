import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccountData, MyContextValue, Options } from './interfaces';
import { useSelectedAccount } from '../hooks/useSelectedAccount';
import { useSelectedUrl } from '../hooks/useSelectedUrl';
import { useUrlList } from '../hooks/useUrlList';

export const Context = createContext<MyContextValue | undefined>(undefined);

export const useSharedState = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('Context value is undefined');
  }
  return context;
};

export function DataContextProvider({ children }: { children: React.ReactNode }) {
  const { data: selectedAccount, update: updateSelectedAccount } = useSelectedAccount();
  const { data: selectedUrl, update: updateSelectedUrl } = useSelectedUrl();
  const { data: urlList, update: updateUrlList } = useUrlList();
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [devnetIsAlive, setDevnetIsAlive] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0n);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [blockInterval, setBlockInterval] = useState<Map<string, number>>(new Map());
  const [commandOptions, setCommandOptions] = useState<Options | null>(null);
  const [configData, setConfigData] = useState<any | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [signatureData, setSignatureData] = useState<any>(null);
  const [lastFetchedUrl, setLastFetchedUrl] = useState<string | null>(null);
  const [blockDetails, setBlockDetails] = useState<any[]>([]);

  useEffect(() => {
    chrome.storage.local.get(null, (data) => {
      if (data) {
        setAccounts(data.accounts || []);
        setCurrentBalance(data.currentBalance || 0n);
        setCurrentBlock(data.currentBlock || 0);
        setBlockInterval(new Map(Object.entries(data.blockInterval || {})));
        setCommandOptions(data.commandOptions || null);
        setConfigData(data.configData || null);
      }
    });
  }, []);

  return (
    <Context.Provider
      value={{
        selectedAccount,
        updateSelectedAccount,
        selectedUrl,
        updateSelectedUrl,
        urlList,
        updateUrlList,
        accounts,
        setAccounts,
        devnetIsAlive,
        setDevnetIsAlive,
        currentBalance,
        setCurrentBalance,
        currentBlock,
        setCurrentBlock,
        blockInterval,
        setBlockInterval,
        commandOptions,
        setCommandOptions,
        configData,
        setConfigData,
        transactionData,
        setTransactionData,
        signatureData,
        setSignatureData,
        lastFetchedUrl,
        setLastFetchedUrl,
        blockDetails,
        setBlockDetails,
      }}
    >
      {children}
    </Context.Provider>
  );
}
