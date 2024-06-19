import React from 'react';
import ReactDOM from 'react-dom/client';
import { SidePanel } from './SidePanel';
import './index.css';
import { MyContextProvider } from '../components/context/context';
import { StarknetProvider } from '../components/starknet/starknet-provider';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <MyContextProvider>
    <StarknetProvider>
      <React.StrictMode>
        <SidePanel />
      </React.StrictMode>
      ,
    </StarknetProvider>
  </MyContextProvider>
);
