import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Menu as MenuIcon, Send as SendIcon } from '@mui/icons-material';
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
  CircularProgress,
} from '@mui/material';
import { getBalanceStr, handleCopyToClipboard, shortenAddress } from '../utils/utils';
import { useCopyTooltip, useFetchTransactionsDetails } from '../hooks/hooks';
import { useSharedState } from '../context/context';
import { printAccountType } from '../../background/utils';
import { AccountType } from '../../background/syncStorage';
import { darkTheme } from '../..';
import { useTokens } from '../hooks/useTokens';
import { logError } from '../../background/analytics';

export const SelectedAccountInfo: React.FC<{}> = () => {
  const { state } = useLocation();
  const type: AccountType = state?.type ?? AccountType.Predeployed;
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
    currentBlock,
  } = context;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { fetchTransactionDetailsForLatestBlocks } = useFetchTransactionsDetails();
  const [transactions, setTransactions] = useState<any[]>([]);
  const isMenuOpen = useMemo(() => Boolean(anchorEl), [anchorEl]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const pageSize = 15;
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const { tokenBalances, getTokenSymbol, hasNonEthTokens } = useTokens();

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
      logError('Error fetching config logs:', error);
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
        logError('Error fetching account', error);
      }
    };
    accountConfig();
  }, []);

  const fetchTransactions = useCallback(async () => {
    const endBlockIndex = currentBlock - (transactionsPage - 1) * pageSize;
    const blocksWithDetails = await fetchTransactionDetailsForLatestBlocks(endBlockIndex, pageSize);
    const trans = blocksWithDetails
      .map((b: any) =>
        b.transactions.map((t: any) => ({
          ...t,
          timestamp: b.timestamp,
          blockNumber: b.block_number,
        }))
      )
      .flat()
      .filter((t: any) => t.sender_address === selectedAccount?.address)
      .map((t: any) => {
        const amountHex = t.calldata?.[5] ? t.calldata[5] : 0;
        const amount = Number(BigInt(amountHex)) / 1e18;
        return {
          amount,
          time: new Date(t.timestamp * 1000),
          ...t,
        };
      }) as any[];
    setTransactions([...transactions, ...trans]);
    setIsLoadingTransactions(false);
  }, [currentBlock, transactionsPage]);

  useEffect(() => {
    fetchTransactions();
  }, [selectedAccount, currentBlock, transactionsPage]);

  const balanceString = useMemo(() => getBalanceStr(currentBalance), [currentBalance]);
  const shortAddress = useMemo(() => shortenAddress(selectedAccount?.address), [selectedAccount]);
  const typeStr = useMemo(() => printAccountType(type), [type]);

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
                display: 'flex',
                alignItems: 'center',
                marginTop: '1px',
              }}
            >
              <Typography marginTop={'1px'} fontSize={'0.8125rem'} lineHeight={'1.5'}>
                Back
              </Typography>
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
              onClick={() =>
                navigate(`/accounts/${selectedAccount?.address}/modify-balance`, {
                  state: { initialBalance: balanceString },
                })
              }
            >
              Modify Balance
            </MenuItem>
          </Menu>
        </Stack>
        {devnetIsAlive && selectedAccount && configData && (
          <>
            {selectedAccount.address && (
              <Container>
                <Box padding={4} paddingLeft={7} display="flex" justifyContent="center">
                  <Typography variant="h5" display="inline-block" paddingRight={1}>
                    {balanceString} ETH
                  </Typography>
                  <Tooltip title="Send">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/accounts/${selectedAccount.address}/send`)}
                      aria-haspopup="true"
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
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
        {hasNonEthTokens ? (
          <>
            <Divider sx={{ marginY: 2 }} variant="middle" />
            <Box>
              <Typography variant="h6">Tokens</Typography>
            </Box>
            <Box>
              <List sx={{ padding: 0 }}>
                {tokenBalances.map(
                  (balance, idx) =>
                    idx !== 0 && (
                      <ListItem key={idx}>
                        <ListItemText sx={{ paddingLeft: 2 }}>
                          {balance.balance} {balance.symbol}
                        </ListItemText>
                      </ListItem>
                    )
                )}
              </List>
            </Box>
          </>
        ) : null}
        {!isLoadingTransactions ? (
          transactions.length ? (
            <>
              <Divider sx={{ marginY: 3 }} variant="middle" />
              <Container>
                <Typography marginBottom={1.5} variant="body1">
                  Sent Transactions
                </Typography>
                <Box>
                  {transactions.map((t, i) => (
                    <Button
                      key={i}
                      fullWidth
                      variant="text"
                      sx={{
                        textTransform: 'none',
                        color: darkTheme.palette.text.secondary,
                        paddingY: '4px',
                      }}
                      onClick={() =>
                        navigate(`/transaction/${t.transaction_hash}`, {
                          state: { transaction: t },
                        })
                      }
                    >
                      <Stack paddingY={0.5} direction="row" alignItems="center" width="100%">
                        <Box textAlign="left" flexGrow={1}>
                          <Typography variant="subtitle2">{t.time.toLocaleString()}</Typography>
                        </Box>
                        <Box textAlign="right" width="35%">
                          {t.amount.toFixed(2)} {getTokenSymbol(t.calldata[1])}
                        </Box>
                      </Stack>
                    </Button>
                  ))}
                </Box>
                {currentBlock - transactionsPage * pageSize >= 0 ? (
                  <Box>
                    <Button
                      onClick={() => setTransactionsPage(transactionsPage + 1)}
                      size="small"
                      variant="text"
                      sx={{ cursor: 'pointer' }}
                    >
                      Load More
                    </Button>
                  </Box>
                ) : null}
              </Container>
            </>
          ) : null
        ) : (
          <Stack direction="row" justifyContent="center" paddingY={2}>
            <CircularProgress size={20} />
          </Stack>
        )}
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
