import React from 'react'
import ReactDOM from 'react-dom/client'
import { Screen1 } from './Screen1'
import './index.css'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <Screen1 />
  </React.StrictMode>,
)
