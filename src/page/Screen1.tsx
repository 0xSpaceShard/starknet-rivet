import { useState, useEffect, useContext } from 'react'

import './Screen1.css'
import { Context } from '../components/context/context'
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts'
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand'

export const Screen1 = () => {
  const getTime = () => {
    const date = new Date()
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${hour}:${minute}`
  }

  const [time, setTime] = useState(getTime())
  const link = 'https://github.com/guocaoyi/create-chrome-ext'
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
    let intervalId = setInterval(() => {
      setTime(getTime())
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

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
      <span></span>
      <h1>Demo Screen1</h1>
      <DockerCommandGenerator />
      <title>Display Accounts</title>
      <PredeployedAccounts />
    </section>
  )
}

export default Screen1
