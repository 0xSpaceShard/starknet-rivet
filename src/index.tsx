import React, { ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { DataContextProvider } from './components/context/context';
import { StarknetProvider } from './components/starknet/starknet-provider';

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

export const SharedComponent: React.FC<SharedComponentProps> = ({ children }) => (
  <DataContextProvider>
    <StarknetProvider>
      <React.StrictMode>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </React.StrictMode>
    </StarknetProvider>
  </DataContextProvider>
);
