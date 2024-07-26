import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AddBoxOutlined, ChevronLeft, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/context';
import { shortenAddress } from '../utils/utils';
import { useAccountContracts } from '../hooks/useAccountContracts';

export const AddTokenContract: React.FC = () => {
  const navigate = useNavigate();
  const context = useSharedState();

  const { selectedAccount } = context;
  const { data: accountContracts, update: updateAccountContracts } = useAccountContracts();

  const [newAddress, setNewAddress] = useState('');

  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}`);
  };

  const handleAdd = useCallback(async () => {
    if (!newAddress?.trim() || !selectedAccount?.address) return;

    const contracts = accountContracts?.get(selectedAccount.address) || [];
    if (contracts.includes(newAddress)) return;

    contracts.push(newAddress);
    accountContracts?.set(selectedAccount.address, contracts);
    await updateAccountContracts(accountContracts);

    setNewAddress('');
  }, [newAddress, selectedAccount, accountContracts]);

  const handleDelete = useCallback(
    async (address: string) => {
      if (!address?.trim() || !selectedAccount?.address) return;

      const contracts = accountContracts?.get(selectedAccount.address) || [];
      if (!contracts.includes(address)) return;

      const updatedContracts = contracts.filter((addr) => addr !== address);
      accountContracts?.set(selectedAccount.address, updatedContracts);
      await updateAccountContracts(accountContracts);
    },
    [selectedAccount, accountContracts]
  );

  const contracts = useMemo(() => {
    return accountContracts.get(selectedAccount?.address ?? '') ?? [];
  }, [accountContracts, selectedAccount]);

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
              Contracts
            </Typography>
          </Container>
        </Stack>
        <form>
          <Box paddingX={2} marginTop={1} marginBottom={3}>
            <Stack direction={'row'} spacing={1} justifyContent={'center'}>
              <Box>
                <TextField
                  variant={'outlined'}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  label={'Address'}
                  size={'small'}
                ></TextField>
              </Box>
              <Box>
                <Tooltip title="Add address">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleAdd();
                    }}
                    color="primary"
                  >
                    <AddBoxOutlined />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Box>
        </form>
        <Divider variant="middle" />
        <Box paddingY={2}>
          <List sx={{ paddingY: 0 }}>
            {contracts.map((address, index) => (
              <ListItem
                key={index}
                disablePadding
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Delete address">
                      <IconButton
                        color="secondary"
                        edge={'end'}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDelete(address);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <ListItemText>
                    <Typography>
                      {address.length > 24 ? shortenAddress(address) : address}
                    </Typography>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </section>
    </>
  );
};
