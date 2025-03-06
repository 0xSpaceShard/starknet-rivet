import React, { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { DataContextProvider } from './components/context/context';
import { StarknetProvider } from './components/starknet/starknet-provider';
import RpcProvider from './context/rpcProvider/RpcProvider';

interface SharedComponentProps {
  children: ReactNode;
}

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1A1A1A',
    },
  },
});

const queryClient = new QueryClient({});

export const SharedComponent: React.FC<SharedComponentProps> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <DataContextProvider>
      <RpcProvider>
        <StarknetProvider>
          <React.StrictMode>
            <ThemeProvider theme={darkTheme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </React.StrictMode>
        </StarknetProvider>
      </RpcProvider>
    </DataContextProvider>
  </QueryClientProvider>
);
