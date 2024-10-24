import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AddBoxOutlined, ChevronLeft } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/context';
import { modifyEthBalance } from '../../background/contracts';

export const ModifyBalance: React.FC = () => {
  const navigate = useNavigate();
  const context = useSharedState();

  const { selectedAccount, updateCurrentBalance } = context;

  const [modifiedBalance, setModifiedBalance] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}`);
  };

  const handleConfirm = useCallback(async () => {
    try {
      const newBalance = BigInt(modifiedBalance);
      if (!newBalance || !selectedAccount?.address) return;
      const balance = await modifyEthBalance(newBalance);
      if (balance) {
        await updateCurrentBalance(balance);
      }
      setErrorMessage('');
      handleBack();
    } catch (error) {
      setErrorMessage('Wrong Input');
    }
  }, [modifiedBalance, selectedAccount]);

  return (
    <>
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
                  value={modifiedBalance}
                  onChange={(e) => setModifiedBalance(e.target.value)}
                  label={'Balance'}
                  size={'small'}
                  error={!!errorMessage}
                  helperText={errorMessage}
                ></TextField>
              </Box>
              <Box>
                <Tooltip title="Modify Balance">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleConfirm();
                    }}
                    disabled={false}
                    color="primary"
                  >
                    <AddBoxOutlined />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Box>
        </form>
      </section>
    </>
  );
};
