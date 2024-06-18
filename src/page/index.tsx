import React from 'react';
import ReactDOM from 'react-dom/client';
import { Screen1 } from './Screen1';
import './index.css';
import { SharedComponent } from '..';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <SharedComponent>
    <Screen1 />
  </SharedComponent>
);
