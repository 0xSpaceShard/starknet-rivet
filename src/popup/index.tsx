import React from 'react'
import ReactDOM from 'react-dom/client'
import { Popup } from './Popup'
import './index.css'
import { SharedComponent } from '..'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <SharedComponent>
    <Popup />
  </SharedComponent>
)
