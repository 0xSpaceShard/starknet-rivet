import React from 'react'
import ReactDOM from 'react-dom/client'
import { Popup } from './Popup'
import './index.css'
import { StarknetProvider } from '../components/starknet/starknet-provider'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <StarknetProvider> 
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
  </StarknetProvider> 
)
