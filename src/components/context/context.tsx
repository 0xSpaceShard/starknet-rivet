"use client";
import { createContext, useEffect, useState } from 'react';
import React from "react";

export interface AccountData {
    address: string;
    initial_balance: string;
    private_key: string;
    public_key: string;
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
    timeOut: number,
    gasPrice: number,
    dataGasPrice: number,
    chainId: string,
    dumpOn: string,
    dumpPath: string,
    stateArchiveCapacity: string,
    forkNetwork: string,
    forkBlock: number,
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
  }
  
  // Step 2: Create the context
export const Context = createContext<MyContextValue | undefined>(undefined);
  
export function MyContextProvider({ children }: { children: React.ReactNode }) {
    const [accounts, setAccounts] = useState<AccountData[]>([]);
    const [url, setUrl] = useState<string>('');
    const [devnetIsAlive, setDevnetIsAlive] = useState(false);
    const [ selectedAccount, setSelectedAccount ] = useState<AccountData | null>(null);
    const [ currentBalance, setCurrentBalance ] = useState(0n);
    const [ commandOptions, setCommandOptions ] = useState<Options | null>(null);

    return (
        <Context.Provider value={{ accounts, setAccounts, url, setUrl, devnetIsAlive, setDevnetIsAlive, selectedAccount, setSelectedAccount, currentBalance, setCurrentBalance, commandOptions, setCommandOptions }}>
          {children}
        </Context.Provider>
    );
};
