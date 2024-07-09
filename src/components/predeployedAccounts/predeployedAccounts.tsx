import React, { useEffect } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { darkTheme } from '../..';
import {
  sendMessageToGetUrl,
  sendMessageToSetSelectedAccount,
  sendMessageToSetUrlList,
} from '../utils/sendMessageBackground';
import { AccountData } from '../context/interfaces';
import { useSharedState } from '../context/context';

export const PredeployedAccounts: React.FC = () => {
  const context = useSharedState();
  const {
    accounts,
    setAccounts,
    url,
    setUrl,
    devnetIsAlive,
    setDevnetIsAlive,
    selectedAccount,
    setSelectedAccount,
    setCurrentBalance,
    urlList,
    setUrlList,
    configData,
    setConfigData,
  } = context;
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
    try {
      const isAlive = await fetch(`${url}/is_alive`);
      if (!isAlive.ok) throw new Error('Devnet is not alive');

      setDevnetIsAlive(true);
      const urlExists = urlList.some((devnet) => devnet.url === url);
      if (!urlExists) {
        sendMessageToSetUrlList({ url, isAlive: true }, setUrlList);
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
      console.error('Error fetching container logs:', error);
      return null;
    }
  }

  useEffect(() => {
    sendMessageToGetUrl(setUrl);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchDataAndPrintAccounts();
    };
    if (url) {
      fetchData();
    }
  }, [url]);

  const handleAccountClick = async (clickedAddress: string) => {
    const clickedAccount = accounts.find((account) => account.address === clickedAddress);
    if (clickedAccount) {
      sendMessageToSetSelectedAccount(clickedAccount, setSelectedAccount);
      await fetchCurrentBalance(clickedAccount.address);
      navigate(`/accounts/${clickedAccount.address}`);
    }
  };

  async function fetchCurrentBalance(address: string | undefined) {
    try {
      let response: Response;
      if (configData?.block_generation_on === 'demand') {
        response = await fetch(`${url}/account_balance?address=${address}&block_tag=pending`);
      } else {
        response = await fetch(`${url}/account_balance?address=${address}`);
      }
      const array = await response.json();
      setCurrentBalance(array.amount);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }

  useEffect(() => {
    const fetchSelectedAccount = async () => {
      if (!selectedAccount) {
        return;
      }
      await fetchCurrentBalance(selectedAccount?.address);
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
                    {getBalanceStr((account as any)?.balance?.eth?.amount)} ETH
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
