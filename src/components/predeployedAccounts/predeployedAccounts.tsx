import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';
import { AccountData } from '../context/interfaces';
import { useSharedState } from '../context/context';
import { CustomAccount, getCustomAccounts } from '../../background/syncStorage';
import { AccountItem } from './AccountItem';

export const PredeployedAccounts: React.FC = () => {
  const context = useSharedState();
  const {
    accounts,
    setAccounts,
    selectedUrl: url,
    devnetIsAlive,
    setDevnetIsAlive,
    updateSelectedAccount,
    updateCurrentBalance,
    urlList,
    updateUrlList,
    configData,
    setConfigData,
    lastFetchedUrl,
    setLastFetchedUrl,
  } = context;
  const navigate = useNavigate();
  const [customAccounts, setCustomAccounts] = useState<CustomAccount[]>([]);

  useEffect(() => {
    loadCustomAccounts();
  }, []);

  async function loadCustomAccounts() {
    const customAccs = await getCustomAccounts();

    const fetchBalancePromises = customAccs.map(async (acc): Promise<CustomAccount> => {
      const response = await fetch(`${url}/account_balance?address=${acc.address}`);
      const data = await response?.json();
      return {
        ...acc,
        balance: { eth: { amount: data?.amount } },
      };
    });
    const accountsWithBalance = await Promise.all(fetchBalancePromises);

    setCustomAccounts(accountsWithBalance);
  }

  async function fetchDataAndPrintAccounts() {
    try {
      const data = await fetchContainerLogs();
      if (data == null) {
        return;
      }
      setAccounts(data);
    } catch (error) {
      console.debug('Error fetching container logs:', error);
    }
  }

  async function fetchContainerLogs(): Promise<AccountData[] | null> {
    try {
      const isAlive = await fetch(`${url}/is_alive`);
      if (!isAlive.ok) throw new Error('Devnet is not alive');

      setDevnetIsAlive(true);
      const urlExists = urlList.some((devnet) => devnet.url === url);
      if (!urlExists) {
        urlList.push({ url, isAlive: true });
        updateUrlList(urlList);
      }
    } catch (error) {
      setDevnetIsAlive(false);
      navigate('/docker-register');
      return null;
    }

    try {
      const configResponse = await fetch(`${url}/config`);
      const dataConfig = await configResponse.json();
      setConfigData(dataConfig);
      const response = await fetch(`${url}/predeployed_accounts?with_balance=true`);
      const data: AccountData[] = await response.json();

      return data;
    } catch (error) {
      console.debug('Error fetching container logs:', error);
      return null;
    }
  }

  useEffect(() => {
    if (!url || url === lastFetchedUrl) return;
    const fetchData = async () => {
      await fetchDataAndPrintAccounts();
      setLastFetchedUrl(url);
    };
    fetchData();
  }, [url, lastFetchedUrl, accounts, devnetIsAlive]);

  const handleAccountClick = async (account: AccountData) => {
    if (!account) return;
    await fetchAndUpdateBalance(account.address);
    await updateSelectedAccount(account);
    navigate(`/accounts/${account.address}`);
  };

  const handleCustomAccountClick = async (account: CustomAccount) => {
    if (!account) return;
    await updateCurrentBalance(BigInt(account?.balance?.eth?.amount ?? 0));
    await updateSelectedAccount(account);
    navigate(`/accounts/${account.address}`, { state: { type: account.type } });
  };

  async function fetchAndUpdateBalance(address: string | undefined) {
    try {
      let fetchUrl = `${url}/account_balance?address=${address}`;
      if (configData?.block_generation_on === 'demand') {
        fetchUrl += '&block_tag=pending';
      }
      const response = await fetch(fetchUrl);
      const data = await response.json();
      await updateCurrentBalance(BigInt(data.amount));
    } catch (error) {
      console.debug('Error fetching balance:', error);
    }
  }

  return (
    <>
      {devnetIsAlive && accounts.length > 0 && (
        <section>
          <Stack marginBottom={1}>
            {accounts.map((account, index) => (
              <AccountItem
                key={index}
                account={account}
                handleAccountClick={handleAccountClick}
              ></AccountItem>
            ))}
            {customAccounts.map((account, index) => (
              <AccountItem
                key={index}
                account={account}
                handleAccountClick={handleCustomAccountClick}
              ></AccountItem>
            ))}
          </Stack>
        </section>
      )}
    </>
  );
};

export default PredeployedAccounts;
