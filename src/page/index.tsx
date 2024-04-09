import React from 'react'
import ReactDOM from 'react-dom/client'
import { Screen1 } from './Screen1'
import './index.css'
import { StarknetProvider } from '../components/starknet/starknet-provider'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <StarknetProvider>
  <React.StrictMode>
    <Screen1 />
  </React.StrictMode>,
  </StarknetProvider>
)
