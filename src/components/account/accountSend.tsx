import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Container,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import React, { useState, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from '@mui/icons-material';
import { fetchCurrentBlockNumber } from '../../background/utils';
import { useSharedState } from '../context/context';
import { sendToAccount } from '../../background/contracts';
import { TokenDropdown } from './tokenDropdown';
import { ETH_ADDRESS } from '../../background/constants';

export const AccountSend: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAccount, updateCurrentBalance, setLastFetchedUrl, setCurrentBlock } =
    useSharedState();
  const [formData, setFormData] = useState<{
    recipient: string;
    amount: number;
    tokenAddress: string;
  }>({
    recipient: '',
    amount: 0,
    tokenAddress: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}`);
  };

  const updateCurrentBlockNumber = async () => {
    const blockNumber = await fetchCurrentBlockNumber();
    if (blockNumber >= 0) {
      setCurrentBlock(blockNumber);
    }
  };

  const submitForm = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!formData.recipient || formData.amount <= 0) return;
      setIsSubmitting(true);
      const sendAmountWei = BigInt(formData.amount * 10 ** 18);
      const balance = await sendToAccount(formData.recipient, sendAmountWei, formData.tokenAddress);
      if (balance && formData.tokenAddress === ETH_ADDRESS) {
        await updateCurrentBalance(balance);
        await updateCurrentBlockNumber();
      }
      setLastFetchedUrl('');
      setIsSubmitting(false);
      handleBack();
    },
    [formData]
  );

  return (
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
            Send
          </Typography>
        </Container>
      </Stack>
      <Box paddingY={1}>
        <form id="account-send-form">
          {!isSubmitting ? (
            <>
              <Stack textAlign={'left'} paddingX={3} spacing={3}>
                <Box flex={1}>
                  <TokenDropdown
                    value={formData.tokenAddress}
                    onChange={(e: SelectChangeEvent) =>
                      setFormData((prev) => ({ ...prev, tokenAddress: e.target.value }))
                    }
                  />
                </Box>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="recipient"
                    value={formData.recipient}
                    label={'Recipient Address'}
                    onChange={(e) => {
                      setFormData({ ...formData, recipient: e.target.value });
                    }}
                    variant={'outlined'}
                    size={'small'}
                    type="text"
                  ></TextField>
                </Box>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="amount"
                    value={formData.amount}
                    label={'Amount'}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: parseInt(e.target.value, 10) });
                    }}
                    variant={'outlined'}
                    size={'small'}
                    type="number"
                  ></TextField>
                </Box>
              </Stack>
              <Box marginTop={3}>
                <Container>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={submitForm}
                    disabled={false}
                    type="submit"
                  >
                    Send
                  </Button>
                </Container>
              </Box>
            </>
          ) : (
            <Stack direction="row" justifyContent="center" paddingY={2}>
              <CircularProgress size={20} />
            </Stack>
          )}
        </form>
      </Box>
    </section>
  );
};
