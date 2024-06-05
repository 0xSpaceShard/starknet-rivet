
import React, { ReactNode } from 'react';
import { MyContextProvider } from './components/context/context';
import { StarknetProvider } from './components/starknet/starknet-provider';

interface SharedComponentProps {
    children: ReactNode;
  }
  
export const SharedComponent: React.FC<SharedComponentProps> = ({ children }) => (
        <MyContextProvider>
            <StarknetProvider>
            <React.StrictMode>
                {children}
            </React.StrictMode>
            </StarknetProvider>
        </MyContextProvider>
);