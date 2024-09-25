import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Menu as MenuIcon } from '@mui/icons-material';
import { num } from 'starknet-6';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { getBalanceStr, handleCopyToClipboard, shortenAddress } from '../utils/utils';
import { useCopyTooltip } from '../hooks/hooks';
import { getTokenBalance } from '../../background/contracts';
import { useSharedState } from '../context/context';
import { useAccountContracts } from '../hooks/useAccountContracts';

export const SelectedAccountInfo: React.FC<{}> = () => {
  const { state } = useLocation();
  const type: string = state?.type ?? '';
  const context = useSharedState();
  const {
    selectedUrl: url,
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
  } = context;
  const { data: accountContracts } = useAccountContracts();

  const [tokenBalances, setTokenBalances] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = useMemo(() => Boolean(anchorEl), [anchorEl]);
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const contracts = useMemo(
    () => accountContracts.get(selectedAccount?.address ?? '') ?? [],
    [accountContracts, selectedAccount]
  );

  useEffect(() => {
    if (!contracts?.length) return;

    // TODO: add validation for address format
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
      const isAlive = await fetch(`${url}/is_alive`);
      if (!isAlive.ok) throw new Error('Devnet is not alive');

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
    navigate('/');
  };

  useEffect(() => {
    const accountConfig = async () => {
      try {
        await fetchAccountConfig();
      } catch (error) {
        console.error(error);
      }
    };
    accountConfig();
  }, []);

  const balanceString = useMemo(() => getBalanceStr(currentBalance), [currentBalance]);
  const shortAddress = useMemo(() => shortenAddress(selectedAccount?.address), [selectedAccount]);
  const typeStr = useMemo(() => {
    switch (type) {
      case 'openzeppelin':
        return 'Open Zeppelin';
      case 'argent':
        return 'Argent';
      case 'braavos':
        return 'Braavos';
      case 'eth':
        return 'Ethereum';
      default:
        return 'Predeployed';
    }
  }, [type]);

  return (
    <section>
      <Box paddingBottom={transactionData || signatureData || tokenBalances?.length ? 3 : 6}>
        <Stack direction={'row'} justifyContent={'space-between'}>
          <Box flexBasis={'80px'} flexShrink={0}>
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
            <Box>
              <Typography variant="h6" margin={0} marginY={2}>
                Account Info
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" margin={0}>
                {typeStr}
              </Typography>
            </Box>
          </Container>
          <Stack
            direction={'row'}
            justifyContent={'flex-end'}
            alignItems={'flex-start'}
            flexBasis={'80px'}
            flexShrink={0}
            padding={'4px 10px'}
          >
            <Tooltip title="Actions">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-haspopup="true"
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          <Menu
            anchorEl={anchorEl}
            id="account-actions"
            open={isMenuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            slotProps={{
              paper: {
                sx: {
                  width: 250,
                  maxWidth: '100%',
                  padding: 0,
                  '& .MuiMenu-list': {
                    padding: 0,
                  },
                },
              },
            }}
          >
            <MenuItem onClick={() => navigate(`/accounts/${selectedAccount?.address}/declare`)}>
              Declare Smart Contract
            </MenuItem>
            <MenuItem onClick={() => navigate(`/accounts/${selectedAccount?.address}/deploy`)}>
              Deploy Smart Contract
            </MenuItem>
            <MenuItem
              onClick={() => navigate(`/accounts/${selectedAccount?.address}/add-token-contract`)}
            >
              Manage Token Contracts
            </MenuItem>
            <MenuItem
              onClick={() => navigate(`/accounts/${selectedAccount?.address}/modify-balance`)}
            >
              Modify Balance
            </MenuItem>
          </Menu>
        </Stack>
        {devnetIsAlive && selectedAccount && configData && (
          <>
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
                        handleCopyToClipboard(selectedAccount?.address);
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
