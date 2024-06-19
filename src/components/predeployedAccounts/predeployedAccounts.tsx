import React, { useEffect, useState } from 'react';
import { AccountData, useSharedState } from '../context/context';
import SingletonContext from '../../services/contextService';
import UrlContext from '../../services/urlService';
import SelectedAccountInfo from '../account/selectedAccount';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { darkTheme } from '../..';
import { useNavigate } from 'react-router-dom';

export const PredeployedAccounts: React.FC = () => {
  const context = useSharedState();
  const {
    accounts,
    setAccounts,
    url,
    devnetIsAlive,
    setDevnetIsAlive,
    selectedAccount,
    setSelectedAccount,
    setCurrentBalance,
    urlList,
    setUrlList,
  } = context;
  const [showSelectedAccount, setShowselectedAccount] = useState(false);
  const navigate = useNavigate();

  async function fetchDataAndPrintAccounts() {
    try {
      const data = await fetchContainerLogs();
      if (data == null) {
        return;
      }
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching container logs:', error);
    }
  }

  async function fetchContainerLogs(): Promise<AccountData[] | null> {
    if (!url) {
      setDevnetIsAlive(false);
      navigate('/docker-register');
      return null;
    }
    try {
      const isAlive = await fetch(`http://${url}/is_alive`);
      if (!isAlive.ok) throw new Error('Devnet is not alive');

      setDevnetIsAlive(true);
      const urlExists = urlList.some((devnet) => devnet.url === url);
      if (!urlExists) {
        setUrlList([...urlList, { url, isAlive: true }]);
      }
    } catch (error) {
      setDevnetIsAlive(false);
      navigate('/docker-register');
      return null;
    }

    try {
      const configResponse = await fetch(`http://${url}/config`);
      await configResponse.json();

      const response = await fetch(`http://${url}/predeployed_accounts`);
      const data: AccountData[] = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching container logs:', error);
      return null;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchDataAndPrintAccounts();
      const context = UrlContext.getInstance();
      if (url) {
        context.setSelectedUrl(url);
      }
    };

    fetchData();
  }, [url]);

  const handleAccountClick = async (clickedAddress: string) => {
    const clickedAccount = accounts.find((account) => account.address === clickedAddress);
    if (clickedAccount) {
      setSelectedAccount(clickedAccount);
      await fetchCurrentBalance(clickedAccount.address);
      navigate(`/accounts/${clickedAccount.address}`);
      chrome.runtime.sendMessage({
        type: 'SET_SELECTED_ACCOUNT',
        selectedAccount: clickedAccount,
      });
    }
  };

  async function fetchCurrentBalance(address: string | undefined) {
    try {
      const response = await fetch(
        `http://${url}/account_balance?address=${address}&block_tag=pending`
      );
      const array = await response.json();
      setCurrentBalance(array.amount);
    } catch (error) {
      console.error('Error fetching container logs:', error);
    }
  }

  useEffect(() => {
    const fetchSelectedAccount = async () => {
      if (!selectedAccount) {
        return;
      }
      await fetchCurrentBalance(selectedAccount?.address);
      const context = SingletonContext.getInstance();
      if (selectedAccount?.address) {
        context.setSelectedAccount(selectedAccount?.address);
      }
      setShowselectedAccount(true);
    };
    fetchSelectedAccount();
  }, [selectedAccount]);

  const handleBack = () => {
    navigate('/');
  };

  const shortenAddress = (address: string, startCount = 12, endCount = 12) =>
    `${address.slice(0, startCount)}...${address.slice(-endCount)}`;

  const getBalanceStr = (balance: string) => {
    const balanceBigInt = BigInt(balance) / BigInt(10n ** 18n);
    return balanceBigInt.toString();
  };

  return (
    <>
      {devnetIsAlive && accounts.length > 0 && (
        <section>
          <Stack direction={'row'} justifyContent={'center'} position={'relative'}>
            <Box position={'absolute'} top={0} left={0}>
              <Button
                size="small"
                variant={'text'}
                startIcon={<ChevronLeft />}
                onClick={handleBack}
                sx={{
                  padding: '8px 10px',
                  // "&:hover": { backgroundColor: "transparent" },
                }}
              >
                Back
              </Button>
            </Box>
            <Container>
              <Typography variant="h6" margin={0} marginY={2}>
                Accounts
              </Typography>
            </Container>
          </Stack>
          <Stack marginBottom={1}>
            {accounts.map((account, index) => (
              <Box key={index}>
                <Button
                  fullWidth
                  variant="text"
                  sx={{
                    textTransform: 'none',
                    paddingY: 1,
                    paddingX: 2,
                    color: darkTheme.palette.text.secondary,
                  }}
                  onClick={() => handleAccountClick(account.address)}
                >
                  <Typography width={'70%'} whiteSpace={'nowrap'}>
                    {shortenAddress(account.address)}
                  </Typography>
                  <Stack direction="row" justifyContent="flex-end" width={'30%'}>
                    {getBalanceStr(account.initial_balance)} ETH
                  </Stack>
                </Button>
              </Box>
            ))}
          </Stack>
        </section>
      )}
    </>
  );
};

export default PredeployedAccounts;
