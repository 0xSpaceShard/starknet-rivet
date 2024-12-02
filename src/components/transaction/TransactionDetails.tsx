import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { HomeTab } from '../home/home';
import DisplayBlockInfo from '../block/displayBlockInfo';

export const TransactionDetails: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { transaction } = state;

  const handleBack = () => {
    navigate('/', { state: { selectedTab: HomeTab.Transactions } });
  };

  return (
    <section>
      <Box>
        <Stack direction={'row'} justifyContent={'flex-start'}>
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
          <Box justifySelf={'center'}>
            <Container>
              <Box>
                <Typography variant="h6" margin={0} marginY={2}>
                  Transaction Info
                </Typography>
              </Box>
            </Container>
          </Box>
        </Stack>
        <Container>
          <Stack
            direction={'row'}
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            justifyContent={'space-between'}
          >
            <DisplayBlockInfo title="Hash" value={transaction.transaction_hash}></DisplayBlockInfo>
            <DisplayBlockInfo title="Sender" value={transaction.sender_address}></DisplayBlockInfo>
            <DisplayBlockInfo title="Nonce" value={transaction.nonce}></DisplayBlockInfo>
            <DisplayBlockInfo
              title="Max Fee"
              value={parseInt(transaction.max_fee || '', 16)}
            ></DisplayBlockInfo>
            {transaction.block_number ? (
              <DisplayBlockInfo
                title="Block Number"
                value={transaction.block_number}
              ></DisplayBlockInfo>
            ) : null}
          </Stack>
        </Container>
      </Box>
    </section>
  );
};

export default TransactionDetails;
