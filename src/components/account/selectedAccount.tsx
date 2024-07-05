import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft } from '@mui/icons-material';
import { num } from 'starknet-6';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { handleCopyAddress, shortenAddress } from '../utils/utils';
import { useCopyTooltip } from '../hooks/hooks';
import { getTokenBalance } from '../../background/contracts';
import { useSharedState } from '../context/context';

export const SelectedAccountInfo: React.FC<{}> = () => {
  const context = useSharedState();
  const {
    url,
    devnetIsAlive,
    setDevnetIsAlive,
    selectedAccount,
    currentBalance,
    setConfigData,
    configData,
    transactionData,
    setTransactionData,
    signatureData,
    setSignatureData,
    accountContracts,
  } = context;

  const [tokenBalances, setTokenBalances] = useState<string[]>([]);

  const contracts = useMemo(
    () => accountContracts.get(selectedAccount?.address ?? '') ?? [],
    [accountContracts, selectedAccount]
  );

  useEffect(() => {
    if (!contracts?.length) return;

    const balancePromises = contracts.map(async (address) => {
      const resp = await getTokenBalance(address);
      if (!resp) return '';

      const balance = resp.balance / BigInt(10n ** 18n);
      const balanceStr = balance.toString();
      return `${balanceStr} ${resp.symbol}`;
    });

    Promise.all(balancePromises).then(setTokenBalances);
  }, [contracts]);

  const { isCopyTooltipShown, showTooltip } = useCopyTooltip();

  const navigate = useNavigate();

  const weiToEth = (wei: string): string => {
    const weiNumber = BigInt(num.hexToDecimalString(wei));
    const ethNumber = weiNumber / BigInt(10 ** 18);
    const ethRemainder = weiNumber % BigInt(10 ** 18);
    const ethString = `${ethNumber.toString()}.${ethRemainder.toString().padStart(18, '0')}`;

    return ethString.replace(/\.?0+$/, '');
  };

  async function fetchAccountConfig(): Promise<any | null> {
    if (!url) {
      setDevnetIsAlive(false);
      return null;
    }
    try {
      const res = await fetch(`${url}/is_alive`);
      setDevnetIsAlive(true);
    } catch (error) {
      setDevnetIsAlive(false);
      return null;
    }

    try {
      const configResponse = await fetch(`${url}/config`);
      const data = await configResponse.json();
      setConfigData(data);
      return data;
    } catch (error) {
      console.error('Error fetching config logs:', error);
      return null;
    }
  }

  const handleConfirm = useCallback(
    (message: any) => {
      if (!selectedAccount || (!transactionData && !signatureData)) return;

      const messageType = transactionData
        ? 'EXECUTE_RIVET_TRANSACTION_RES'
        : 'SIGN_RIVET_MESSAGE_RES';

      chrome.runtime.sendMessage({
        type: messageType,
        data: message,
      });

      setTransactionData(null);
      setSignatureData(null);

      chrome.windows.getCurrent((window) => {
        if (window && window.id) {
          chrome.windows.remove(window.id);
        }
      });
    },
    [selectedAccount, transactionData, signatureData]
  );

  const handleDecline = useCallback(
    (message: any) => {
      if (selectedAccount) {
        const messageType = transactionData
          ? 'RIVET_TRANSACTION_FAILED'
          : 'SIGNATURE_RIVET_FAILURE';

        chrome.runtime.sendMessage({
          type: messageType,
          data: message,
        });
        setTransactionData(null);
        setSignatureData(null);

        chrome.windows.getCurrent((window) => {
          if (window && window.id) {
            chrome.windows.remove(window.id);
          }
        });
      }
    },
    [selectedAccount]
  );

  const handleBack = () => {
    navigate('/accounts');
  };

  const handleSettings = () => {
    navigate(`/accounts/${selectedAccount?.address}/settings`);
  };

  useEffect(() => {
    const accountConfig = async () => {
      try {
        await fetchAccountConfig();
      } catch (error) {}
    };
    accountConfig();
  }, []);

  const balanceBigInt = BigInt(currentBalance) / BigInt(10n ** 18n);
  const balanceString = balanceBigInt.toString();
  const shortAddress = shortenAddress(selectedAccount?.address);

  return (
    <section>
      <Box paddingBottom={transactionData || signatureData || tokenBalances?.length ? 3 : 6}>
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
              Account Info
            </Typography>
          </Container>
          <Box position={'absolute'} top={0} right={0}>
            <Tooltip title="Settings">
              <Button
                size="small"
                variant={'text'}
                startIcon={<SettingsIcon />}
                onClick={handleSettings}
                sx={{
                  padding: '8px 10px',
                }}
              ></Button>
            </Tooltip>
          </Box>
        </Stack>
        {devnetIsAlive && selectedAccount && configData && (
          <>
            <Divider variant="middle" />
            <Box
              width={'100%'}
              display={'flex'}
              justifyContent={'flex-end'}
              alignItems={'center'}
              padding={2}
            >
              <Typography variant="caption">Chain ID: {configData.chain_id}</Typography>
            </Box>
            {selectedAccount.address && (
              <Container>
                <Box padding={4}>
                  <Typography variant="h5">{balanceString} ETH</Typography>
                </Box>
                <Box paddingY={1}>
                  <Tooltip
                    PopperProps={{
                      disablePortal: true,
                    }}
                    open={isCopyTooltipShown}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title="Address copied to clipboard"
                  >
                    <Link
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopyAddress(selectedAccount?.address);
                        showTooltip();
                      }}
                    >
                      {shortAddress}
                    </Link>
                  </Tooltip>
                </Box>
              </Container>
            )}
          </>
        )}
        {tokenBalances?.length ? (
          <>
            <Divider sx={{ marginY: 2 }} variant="middle" />
            <Box>
              <Typography variant="h6">Tokens</Typography>
            </Box>
            <Box>
              <List sx={{ padding: 0 }}>
                {tokenBalances.map((balance, idx) => (
                  <ListItem key={idx}>
                    <ListItemText sx={{ paddingLeft: 2 }}>{balance}</ListItemText>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        ) : null}
        {transactionData && (
          <>
            <Divider sx={{ marginY: 3 }} variant="middle" />
            <Container>
              <Typography variant="body1">Transaction Details</Typography>
              <Box
                component="pre"
                padding={1}
                textAlign={'left'}
                borderRadius={'5px'}
                whiteSpace={'pre-wrap'}
                sx={{
                  wordBreak: 'break-word',
                  color: transactionData.error ? 'red' : 'inherit',
                }}
              >
                {transactionData.error
                  ? JSON.stringify(transactionData.error, null, 2)
                  : JSON.stringify(transactionData.data, null, 2)}
              </Box>
              {transactionData.gas_fee && (
                <Box
                  component="pre"
                  padding={1}
                  marginTop={2}
                  marginBottom={2}
                  textAlign={'left'}
                  border={'1px solid grey'}
                  borderRadius={'5px'}
                  display={'inline-block'}
                  sx={{
                    wordBreak: 'break-word',
                    backgroundColor: 'darkgrey',
                  }}
                >
                  <strong>Estimate Fee:</strong> {weiToEth(transactionData.gas_fee)} ETH
                </Box>
              )}
              <Stack justifyContent={'center'} direction={'row'} spacing={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleConfirm(transactionData.data)}
                  disabled={!!transactionData.error}
                >
                  Confirm
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleDecline(transactionData.data)}
                >
                  Decline
                </Button>
              </Stack>
            </Container>
          </>
        )}
        {signatureData && (
          <>
            <Divider sx={{ marginY: 3 }} variant="middle" />
            <Container>
              <Typography variant="body1">Signature Details</Typography>
              <Box
                component="pre"
                padding={1}
                textAlign={'left'}
                borderRadius={'5px'}
                whiteSpace={'pre-wrap'}
                sx={{
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(signatureData, null, 2)}
              </Box>
              <Stack justifyContent={'center'} direction={'row'} spacing={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleConfirm(signatureData)}
                >
                  Confirm
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleDecline(signatureData.data)}
                >
                  Decline
                </Button>
              </Stack>
            </Container>
          </>
        )}
      </Box>
    </section>
  );
};

export default SelectedAccountInfo;
