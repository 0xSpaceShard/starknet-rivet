import { useEffect } from 'react'

import './Screen1.css'
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts'
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand'
import RegisterRunningDocker from '../components/registerRunningDocker/registerRunningDocker'
import { useSharedState } from '../components/context/context'

export const Screen1 = () => {
  const context = useSharedState();
  const { selectedComponent, setSelectedComponent } = context;


  interface SelectedComponentMessage {
    type: 'SELECTED_COMPONENT_CHANGED';
    selectedComponent: string;
  }
  
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CHANGE_SELECTED_COMPONENT') {
      const selectedComponent = event.data.selectedComponent; 
      setSelectedComponent(selectedComponent);
    }
  });

  return (
    <section>
      {selectedComponent === '' && (
        <div>
              <button
                  style={{ marginRight: '10px' }}
                  onClick={() => setSelectedComponent('DockerCommandGenerator')}
              >
                  Docker Command Generator
              </button>
              <button onClick={() => setSelectedComponent('RegisterRunningDocker')}>
                  Register Running Docker
              </button>
        </div>
      )} 
      {selectedComponent === 'DockerCommandGenerator' && <DockerCommandGenerator />}
      {selectedComponent === 'RegisterRunningDocker' && <RegisterRunningDocker />}
      <title>Display Accounts</title>
      <PredeployedAccounts />
    </section>
  )
}

export default Screen1


