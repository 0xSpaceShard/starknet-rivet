import { useEffect, useContext } from 'react'

import { Context } from '../context/context';


export const PredeployedAccounts = () => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('Context value is undefined');
  }

  const { accounts, setAccounts } = context;
  
  async function fetchContainerLogs(): Promise<string | null> {
    try {
      const response = await fetch('http://127.0.0.1:5050/predeployed_accounts');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching container logs:', error);
      return null;
    }
  }
  
  function parseAccounts(data: any): string[] {
    if (data === null) {
      return [];
    }
    let address = [];
    for (let index = 0; index < data.length; index++) {
     address.push(data[index].address);
    }
    return address;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchContainerLogs();
        const accounts = parseAccounts(data);
        setAccounts(accounts);
      } catch (error) {
        console.error('Error fetching container logs:', error);
      }
    }
    fetchData();
  }, []);
  return (
    <section>
        <h1 className="section-heading">Accounts</h1>
            <ul>
            {accounts.map((account, index) => (
                <li key={index} style={{ width: '100%', textAlign: 'left' }}>{account}</li>
                ))}
        </ul>
    </section>
  )
}

export default PredeployedAccounts
