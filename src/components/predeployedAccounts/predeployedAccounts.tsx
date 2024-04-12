import React, { useEffect, useContext } from 'react';
import { Context } from '../context/context';
import './predeployedAccounts.css';

interface AccountData {
  address: string;
}

export const PredeployedAccounts: React.FC = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error('Context value is undefined');
  }

  const { accounts, setAccounts, url } = context;

  async function fetchContainerLogs(): Promise<AccountData[] | null> {
    if (!url) {
      return null;
    }

    try {
      const response = await fetch(`http://${url}/predeployed_accounts`);
      const data: AccountData[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching container logs:', error);
      return null;
    }
  }

  function parseAccounts(data: AccountData[] | null): string[] {
    if (data === null) {
      return [];
    }

    return data.map((item: AccountData) => item.address);
  }

  async function fetchDataAndPrintAccounts() {
    try {
      const data = await fetchContainerLogs();
      const accounts = parseAccounts(data);
      setAccounts(accounts);
    } catch (error) {
      console.error('Error fetching container logs:', error);
    }
  }

  useEffect(() => {
    fetchDataAndPrintAccounts();
  }, [url]);

  return (
    <>
      {accounts.length > 0 && (
        <section>
          <h1 className="section-heading">Accounts</h1>
          <ul>
            {accounts.map((account, index) => (
              <li key={index} style={{ width: '100%', textAlign: 'left' }}>
                {account}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default PredeployedAccounts;