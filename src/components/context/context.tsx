
import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";

export interface AccountData {
    address: string;
    initial_balance: string;
    private_key: string;
    public_key: string;
}

export interface ListOfDevnet {
  url: string;
  isAlive: boolean;
}

export interface Options {
    accounts: number;
    accountClass: string;
    accountClassCustom: string;
    initialBalance: string;
    seed: string;
    host: string;
    port: number;
    startTime: number,
    timeout: number,
    gasPrice: number,
    dataGasPrice: number,
    chainId: string,
    dumpOn: string,
    dumpPath: string,
    stateArchiveCapacity: string,
    forkNetwork: string,
    forkBlock: number,
    requestBodySizeLimit: number,
}

interface MyContextValue {
    accounts: AccountData[];
    setAccounts: React.Dispatch<React.SetStateAction<AccountData[]>>;
    url: string;
    setUrl: React.Dispatch<React.SetStateAction<string>>;
    devnetIsAlive: boolean;
    setDevnetIsAlive: React.Dispatch<React.SetStateAction<boolean>>;
    selectedAccount: AccountData | null;
    setSelectedAccount: React.Dispatch<React.SetStateAction<AccountData| null>>;
    currentBalance: bigint;
    setCurrentBalance:React.Dispatch<React.SetStateAction<bigint>>;
    commandOptions: Options | null;
    setCommandOptions:React.Dispatch<React.SetStateAction<Options| null>>;
    configData: any | null;
    setConfigData: React.Dispatch<React.SetStateAction<any | null>>;
    urlList: ListOfDevnet[];
    setUrlList: React.Dispatch<React.SetStateAction<ListOfDevnet[]>>;
    selectedComponent: string;
    setSelectedComponent: React.Dispatch<React.SetStateAction<string>>;
  }
  
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
    const [ selectedAccount, setSelectedAccount ] = useState<AccountData | null>(null);
    const [ currentBalance, setCurrentBalance ] = useState(0n);
    const [ commandOptions, setCommandOptions ] = useState<Options | null>(null);
    const [ configData, setConfigData ] = useState<any | null>(null);
    const [ urlList, setUrlList ] = useState<ListOfDevnet[]>([]);
    const [selectedComponent, setSelectedComponent] = useState("");

    useEffect(() => {
      chrome.storage.local.get(null, (data) => {
        if (data) {
          setAccounts(data.accounts || []);
          setUrl(data.url || '');
          setSelectedAccount(data.selectedAccount || null);
          setCurrentBalance(data.currentBalance || 0n);
          setCommandOptions(data.commandOptions || null);
          setConfigData(data.configData || null);
          setUrlList(data.urlList || []);
          setSelectedComponent(data.selectedComponent || "");
        }
      });
    }, []);
    
    useEffect(() => {
      const dataToSave = {
        accounts,
        url,
        selectedAccount,
        currentBalance,
        commandOptions,
        configData,
        urlList,
        selectedComponent,
      };
      chrome.storage.local.set(dataToSave);
    }, [accounts, url, selectedAccount, currentBalance, commandOptions, configData, urlList, selectedComponent]);
  

    return (
        <Context.Provider value={{ accounts, setAccounts, url, setUrl, devnetIsAlive, setDevnetIsAlive, selectedAccount, setSelectedAccount, currentBalance, setCurrentBalance, commandOptions, setCommandOptions, configData, setConfigData, urlList, setUrlList, selectedComponent, setSelectedComponent }}>
          {children}
        </Context.Provider>
    );
};
