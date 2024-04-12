"use client";
import { createContext, useEffect, useState } from 'react';
import React from "react";

// Step 1: Define the type of your context value
interface MyContextValue {
    accounts: string[];
    setAccounts: React.Dispatch<React.SetStateAction<string[]>>;
    url: string;
    setUrl: React.Dispatch<React.SetStateAction<string>>;
  }
  
  // Step 2: Create the context
export const Context = createContext<MyContextValue | undefined>(undefined);
  
export function MyContextProvider({ children }: { children: React.ReactNode }) {
    const [accounts, setAccounts] = useState<string[]>([]);
    const [url, setUrl] = useState<string>('');

    return (
        <Context.Provider value={{ accounts, setAccounts, url, setUrl }}>
          {children}
        </Context.Provider>
    );
};
