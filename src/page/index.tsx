import React from 'react'
import ReactDOM from 'react-dom/client'
import { Screen1 } from './Screen1'
import './index.css'
import { StarknetProvider } from '../components/starknet/starknet-provider'
import { MyContextProvider } from '../components/context/context'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <MyContextProvider>
  <StarknetProvider>
      <React.StrictMode>
        <Screen1 />
      </React.StrictMode>,
    </StarknetProvider>
  </MyContextProvider>
)
