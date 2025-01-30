import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { HomeTab } from '../home/home';
import DisplayBlockInfo from '../block/displayBlockInfo';
import { useTokens } from '../hooks/useTokens';

export const TransactionDetails: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { transaction } = state;
  const { getTokenSymbol } = useTokens();

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
            spacing={2}
            useFlexGap
            flexWrap="wrap"
            justifyContent={'space-between'}
          >
            <DisplayBlockInfo
              title="Hash"
              value={transaction.transaction_hash}
              isCopyable
            ></DisplayBlockInfo>
            <DisplayBlockInfo
              title="Sender"
              value={transaction.sender_address}
              isCopyable
            ></DisplayBlockInfo>
            <DisplayBlockInfo title="Nonce" value={transaction.nonce}></DisplayBlockInfo>
            {transaction.blockNumber ? (
              <DisplayBlockInfo
                title="Block Number"
                value={transaction.blockNumber}
              ></DisplayBlockInfo>
            ) : null}
            <DisplayBlockInfo
              title="Max Fee"
              value={parseInt(transaction.max_fee || '', 16)}
            ></DisplayBlockInfo>
            <DisplayBlockInfo title="Contract Address" value={transaction.calldata[1]} isCopyable />
            {transaction.amount && (
              <DisplayBlockInfo
                title="Amount"
                value={`${transaction.amount} ${getTokenSymbol(transaction.calldata[1]) || ''}`}
              />
            )}
          </Stack>
        </Container>
      </Box>
    </section>
  );
};

export default TransactionDetails;
