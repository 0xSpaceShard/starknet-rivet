import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccountData, ListOfDevnet, MyContextValue, Options } from './interfaces';
import { DEFAULT_DEVNET_URL } from '../../background/constants';
import { useSelectedAccount } from '../hooks/useSelectedAccount';
import { useSelectedUrl } from '../hooks/useSelectedUrl';

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
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [devnetIsAlive, setDevnetIsAlive] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0n);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [blockInterval, setBlockInterval] = useState<Map<string, number>>(new Map());
  const [commandOptions, setCommandOptions] = useState<Options | null>(null);
  const [configData, setConfigData] = useState<any | null>(null);
  const [urlList, setUrlList] = useState<ListOfDevnet[]>([]);
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
        setUrlList(data.urlList || [{ url: DEFAULT_DEVNET_URL, isAlive: false }]);
      }
    });
  }, []);

  // useEffect(() => {
  //   const dataToSave = {
  //     accounts,
  //     url,
  //     selectedAccount,
  //     currentBalance,
  //     currentBlock,
  //     blockInterval: Object.fromEntries(blockInterval),
  //     commandOptions,
  //     configData,
  //     urlList,
  //   };
  //   // console.log('saving', dataToSave);
  //   chrome.storage.local.set(dataToSave);
  // }, [
  //   accounts,
  //   url,
  //   selectedAccount,
  //   currentBalance,
  //   currentBlock,
  //   blockInterval,
  //   commandOptions,
  //   configData,
  //   urlList,
  // ]);

  return (
    <Context.Provider
      value={{
        accounts,
        setAccounts,
        selectedUrl,
        updateSelectedUrl,
        devnetIsAlive,
        setDevnetIsAlive,
        selectedAccount,
        updateSelectedAccount,
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
        urlList,
        setUrlList,
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
