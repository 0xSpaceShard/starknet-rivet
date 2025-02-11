import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Grid,
} from '@mui/material';
import { CheckBoxOutlined, ChevronLeft } from '@mui/icons-material';
import { useSharedState } from '../context/context';
import { modifyEthBalance } from '../../background/contracts';
import { Spinner } from '../utils/spinner';
import { fetchCurrentBlockNumber } from '../../background/utils';
import { logError } from '../../background/analytics';

export const ModifyBalance: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { selectedAccount, updateCurrentBalance, setLastFetchedUrl, setCurrentBlock } =
    useSharedState();

  const [balanceInputStr, setBalanceInputStr] = useState(state?.initialBalance ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}`);
  };

  const updateCurrentBlockNumber = async () => {
    const blockNumber = await fetchCurrentBlockNumber();
    if (blockNumber >= 0) {
      setCurrentBlock(blockNumber);
    }
  };

  const validateBalance = (balance: number) => {
    if (!balance || balance < 0.01 || balance > 1000000) {
      setErrorMessage('Amount must be between 0.01 and 1,000,000');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleConfirm = useCallback(async () => {
    setIsUpdating(true);
    try {
      const newBalanceFloat = parseFloat(balanceInputStr);
      if (!validateBalance(newBalanceFloat)) return;

      const newBalance = BigInt(newBalanceFloat * 10 ** 18);
      if (!newBalance || !selectedAccount?.address) return;
      const balance = await modifyEthBalance(newBalance);
      if (balance) {
        await updateCurrentBalance(balance);
        await updateCurrentBlockNumber();
      }
      setLastFetchedUrl('');
      handleBack();
    } catch (error) {
      logError('Error modifying balance', error);
    } finally {
      setIsUpdating(false);
    }
  }, [balanceInputStr, selectedAccount]);

  const updateBalance = (value: string) => {
    setBalanceInputStr(value);
    const newBalance = parseFloat(value);
    validateBalance(newBalance);
  };

  return (
    <>
      <section>
        {isUpdating ? (
          <Grid container direction={'column'} alignItems={'center'}>
            <Box marginTop={2} marginBottom={3}>
              <Typography variant="h6">Updating balance...</Typography>
            </Box>
            <Spinner />
          </Grid>
        ) : (
          <>
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
                  Modify Balance
                </Typography>
              </Container>
            </Stack>
            <form>
              <Box paddingX={2} marginTop={1} marginBottom={3}>
                <Stack direction={'row'} spacing={1} justifyContent={'center'}>
                  <Box>
                    <TextField
                      variant={'outlined'}
                      value={balanceInputStr}
                      onChange={(e) => updateBalance(e.target.value)}
                      label={'Balance'}
                      size={'small'}
                      error={!!errorMessage}
                      helperText={errorMessage}
                      type="number"
                    ></TextField>
                  </Box>
                  <Box flexBasis="60px" paddingY="8px">
                    <Typography>ETH</Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Modify Balance">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleConfirm();
                        }}
                        disabled={!!errorMessage}
                        color="primary"
                      >
                        <CheckBoxOutlined />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Stack>
              </Box>
            </form>
          </>
        )}
      </section>
    </>
  );
};
