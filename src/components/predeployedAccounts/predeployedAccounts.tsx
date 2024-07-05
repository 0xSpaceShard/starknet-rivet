import React, { useEffect } from 'react';
import { useSharedState } from '../context/context';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { darkTheme } from '../..';
import { useNavigate } from 'react-router-dom';
import {
  sendMessageToGetUrl,
  sendMessageToSetSelectedAccount,
  sendMessageToSetUrlList,
} from '../utils/sendMessageBackground';
import { AccountData } from '../context/interfaces';

const PredeployedAccounts: React.FC = () => {
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
  } = useSharedState();
  const navigate = useNavigate();

  useEffect(() => {
    sendMessageToGetUrl(setUrl);
  }, [setUrl]);

  useEffect(() => {
    if (url) {
      fetchDataAndPrintAccounts();
    }
  }, [url]);

  useEffect(() => {
    if (selectedAccount) {
      fetchCurrentBalance(selectedAccount.address);
    }
  }, [selectedAccount]);

  const fetchDataAndPrintAccounts = async () => {
    try {
      const data = await fetchContainerLogs();
      if (data) {
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching container logs:', error);
    }
  };

  const fetchContainerLogs = async (): Promise<AccountData[] | null> => {
    try {
      const isAliveResponse = await fetch(`${url}/is_alive`);
      if (!isAliveResponse.ok) throw new Error('Devnet is not alive');
      setDevnetIsAlive(true);

      if (!urlList.some((devnet) => devnet.url === url)) {
        sendMessageToSetUrlList({ url, isAlive: true }, setUrlList);
      }

      const configResponse = await fetch(`${url}/config`);
      const dataConfig = await configResponse.json();
      setConfigData(dataConfig);

      const accountsResponse = await fetch(`${url}/predeployed_accounts`);
      return accountsResponse.json();
    } catch (error) {
      setDevnetIsAlive(false);
      navigate('/docker-register');
      return null;
    }
  };

  const fetchCurrentBalance = async (address?: string) => {
    try {
      if (!address) return;

      const response = await fetch(
        `${url}/account_balance?address=${address}&block_tag=${configData?.block_generation_on === 'demand' ? 'pending' : ''}`
      );
      const data = await response.json();
      setCurrentBalance(data.amount);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleAccountClick = async (clickedAddress: string) => {
    const clickedAccount = accounts.find((account) => account.address === clickedAddress);
    if (clickedAccount) {
      sendMessageToSetSelectedAccount(clickedAccount, setSelectedAccount);
      await fetchCurrentBalance(clickedAccount.address);
      navigate(`/accounts/${clickedAccount.address}`);
    }
  };

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
                variant="text"
                startIcon={<ChevronLeft />}
                onClick={handleBack}
                sx={{ padding: '8px 10px' }}
              >
                Back
              </Button>
            </Box>
            <Container>
              <Typography variant="h6" marginY={2}>
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
                  <Typography width="70%" whiteSpace="nowrap">
                    {shortenAddress(account.address)}
                  </Typography>
                  <Stack direction="row" justifyContent="flex-end" width="30%">
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
