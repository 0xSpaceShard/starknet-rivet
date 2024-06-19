import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import { Popup } from './Popup';
import './index.css';
import { SharedComponent } from '..';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <Router>
    <SharedComponent>
      <Popup />
    </SharedComponent>
  </Router>
);
