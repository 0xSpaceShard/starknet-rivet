import UrlContext from '../../../services/urlService';

export async function requestChainIdHandler() {
  const context = UrlContext.getInstance();
  if (!context) {
    throw new Error('Context value is undefined');
  }
  const url = context.getSelectedUrl();

  if (url) {
    const configResponse = await fetch(`http://${url}/config`);
    const configData = await configResponse.json();
    return configData.chain_id;
  }
  throw new Error('No conextion');
}
