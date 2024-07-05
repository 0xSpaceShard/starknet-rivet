import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccountData, ListOfDevnet, MyContextValue, Options } from './interfaces';
import { Component } from './enum';
import { DEFAULT_DEVNET_URL } from '../../background/constants';

export const Context = createContext<MyContextValue | undefined>(undefined);

export const useSharedState = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('Context value is undefined');
  }
  return context;
};

export function MyContextProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [url, setUrl] = useState<string>('');
  const [devnetIsAlive, setDevnetIsAlive] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0n);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [blockInterval, setBlockInterval] = useState<Map<string, number>>(new Map());
  const [commandOptions, setCommandOptions] = useState<Options | null>(null);
  const [configData, setConfigData] = useState<any | null>(null);
  const [urlList, setUrlList] = useState<ListOfDevnet[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [signatureData, setSignatureData] = useState<any>(null);

  useEffect(() => {
    chrome.storage.local.get(null, (data) => {
      if (data) {
        setAccounts(data.accounts || []);
        setUrl(data.url || DEFAULT_DEVNET_URL);
        setSelectedAccount(data.selectedAccount || null);
        setCurrentBalance(data.currentBalance || 0n);
        setCurrentBlock(data.currentBlock || 0);
        setBlockInterval(new Map(Object.entries(data.blockInterval || {})));
        setCommandOptions(data.commandOptions || null);
        setConfigData(data.configData || null);
        setUrlList(data.urlList || [{ url: DEFAULT_DEVNET_URL, isAlive: false }]);
        setSelectedComponent(data.selectedComponent || '');
      }
    });
  }, []);

  useEffect(() => {
    const dataToSave = {
      accounts,
      url,
      selectedAccount,
      currentBalance,
      currentBlock,
      blockInterval: Object.fromEntries(blockInterval),
      commandOptions,
      configData,
      urlList,
      selectedComponent,
    };
    chrome.storage.local.set(dataToSave);
  }, [
    accounts,
    url,
    selectedAccount,
    currentBalance,
    currentBlock,
    blockInterval,
    commandOptions,
    configData,
    urlList,
    selectedComponent,
  ]);

  return (
    <Context.Provider
      value={{
        accounts,
        setAccounts,
        url,
        setUrl,
        devnetIsAlive,
        setDevnetIsAlive,
        selectedAccount,
        setSelectedAccount,
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
        selectedComponent,
        setSelectedComponent,
        transactionData,
        setTransactionData,
        signatureData,
        setSignatureData,
      }}
    >
      {children}
    </Context.Provider>
  );
}
