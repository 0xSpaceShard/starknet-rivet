import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { Popup } from './Popup';
import './index.css';
import { SharedComponent } from '..';
import { ViewContextProvider } from '../components/context/viewContext';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <Router>
    <SharedComponent>
      <ViewContextProvider mode={'popup'}>
        <Popup />
      </ViewContextProvider>
    </SharedComponent>
  </Router>
);
