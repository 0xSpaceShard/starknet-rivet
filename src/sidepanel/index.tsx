import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import { SidePanel } from './SidePanel';
import './index.css';
import { SharedComponent } from '..';
import { ViewContextProvider } from '../components/context/viewContext';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <Router>
    <SharedComponent>
      <ViewContextProvider mode={'sidepanel'}>
        <SidePanel />
      </ViewContextProvider>
    </SharedComponent>
  </Router>
);
