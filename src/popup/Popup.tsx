import { useEffect } from 'react'

import './Popup.css'
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts'
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand'
import RegisterRunningDocker from '../components/registerRunningDocker/registerRunningDocker'
import { useSharedState } from '../components/context/context'
import { Button } from '@mui/material'

export const Popup = () => {
  const context = useSharedState();
  const { selectedComponent, setSelectedComponent, url } = context;

  interface SelectedComponentMessage {
    type: 'SELECTED_COMPONENT_CHANGED';
    selectedComponent: string;
  }
  
  const switchComponent = (newSelectedComponent: string) => {
    if (newSelectedComponent == 'PredeployedAccounts' && !url) {
      setSelectedComponent('');
      return;
    }
    setSelectedComponent(newSelectedComponent);
  };
  
  return (
    <main>
      {selectedComponent === '' && ( 
        <div style={{ marginBottom: '20px' }}>
          <Button
            variant={'outlined'}
            style={{ marginRight: '10px' }}
            onClick={() => switchComponent("DockerCommandGenerator")}
          >
            Docker Command Generator
          </Button>
          <Button
            variant={'outlined'}
            onClick={() => switchComponent('RegisterRunningDocker')}
          >
            Register Running Docker
          </Button>

          {!url && (
            <p>No Predeployed accounts</p>
          )}

          <Button
            variant={'outlined'}
            onClick={() => switchComponent('PredeployedAccounts')}
          >
            Show Predeployed Accounts
          </Button>
        </div>
      )}
      {selectedComponent === 'DockerCommandGenerator' && <DockerCommandGenerator />}
      {selectedComponent === 'RegisterRunningDocker' && <RegisterRunningDocker />}
      {selectedComponent === 'PredeployedAccounts' && url && <PredeployedAccounts />}
    </main>
  );
}
export default Popup
