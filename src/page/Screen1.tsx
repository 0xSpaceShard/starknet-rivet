import './Screen1.css';
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts';
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand';
import RegisterRunningDocker from '../components/registerRunningDocker/registerRunningDocker';
import { Component, useSharedState } from '../components/context/context';

export const Screen1 = () => {
  const context = useSharedState();
  const { selectedComponent, setSelectedComponent } = context;

  window.addEventListener('message', (event) => {
    if (event.data.type === 'CHANGE_SELECTED_COMPONENT') {
      const { selectedComponent: component } = event.data;
      setSelectedComponent(component);
    }
  });

  return (
    <section>
      {!selectedComponent && (
        <div>
          <button
            style={{ marginRight: '10px' }}
            onClick={() => setSelectedComponent(Component.CommandGenerator)}
          >
            Docker Command Generator
          </button>
          <button onClick={() => setSelectedComponent(Component.DockerRegister)}>
            Register Running Docker
          </button>
        </div>
      )}
      {selectedComponent === Component.CommandGenerator && <DockerCommandGenerator />}
      {selectedComponent === Component.DockerRegister && <RegisterRunningDocker />}
      <title>Display Accounts</title>
      <PredeployedAccounts />
    </section>
  );
};

export default Screen1;
