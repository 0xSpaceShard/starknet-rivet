import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { useSharedState } from '../context/context';
import { darkTheme } from '../..';
import DisplayBlockInfo from './displayBlockInfo';
import { useFetchTransactionsDetails } from '../hooks/hooks';
import { HomeTab } from '../home/home';

const BlockDetailsPage: React.FC = () => {
  const context = useSharedState();
  const navigate = useNavigate();
  const { blockDetails } = context;
  const { blockIndex } = useParams<{ blockIndex: string }>();
  const index = parseInt(blockIndex || '', 10);
  const { fetchTransactionsDetailsByBlock } = useFetchTransactionsDetails();

  const handleBack = () => {
    navigate('/', { state: { selectedTab: HomeTab.Blocks } });
  };

  useEffect(() => {
    const fetchTransactionsDetails = async () => {
      try {
        await fetchTransactionsDetailsByBlock(index);
      } catch (error) {
        console.error('Error fetching current block number:', error);
      }
    };
    fetchTransactionsDetails();
  }, []);

  return (
    <>
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
      </Stack>
      <Box paddingX={2} paddingY={1} flexGrow={1}>
        <Stack direction={'row'} spacing={{ xs: 2, sm: 2 }} useFlexGap flexWrap="wrap">
          <DisplayBlockInfo
            title="Block Number"
            value={blockDetails.block_number}
          ></DisplayBlockInfo>
          <DisplayBlockInfo title="Block Hash" value={blockDetails.block_hash}></DisplayBlockInfo>
          <DisplayBlockInfo
            title="Timestamp"
            value={blockDetails.timestamp ?? 'Unknown'}
          ></DisplayBlockInfo>
          <DisplayBlockInfo
            title="Starknet Version"
            value={blockDetails.starknet_version ?? 'Unknown'}
          ></DisplayBlockInfo>
          <DisplayBlockInfo
            title="Transactions"
            value={blockDetails.transactions ? blockDetails.transactions.length : '0'}
          ></DisplayBlockInfo>
          <DisplayBlockInfo
            title="Status"
            value={blockDetails.status ?? 'Unknown'}
          ></DisplayBlockInfo>
        </Stack>
        {blockDetails.transactions && blockDetails.transactions.length > 0 && (
          <>
            <Divider sx={{ marginY: 1 }} variant="middle" />
            <Stack alignItems={'flex-start'}>
              <Typography color={darkTheme.palette.text.secondary} variant="h6" marginY={1}>
                Transactions
              </Typography>
            </Stack>
            {blockDetails.transactions
              .slice()
              .reverse()
              .map((info: any, idx: number) => (
                <>
                  <Stack direction={'row'} spacing={{ xs: 2, sm: 2 }} useFlexGap flexWrap="wrap">
                    <DisplayBlockInfo title="Hash" value={info.transaction_hash}></DisplayBlockInfo>
                    <DisplayBlockInfo title="Sender" value={info.sender_address}></DisplayBlockInfo>
                    <DisplayBlockInfo title="Nonce" value={info.nonce}></DisplayBlockInfo>
                    <DisplayBlockInfo
                      title="Max Fee"
                      value={parseInt(info.max_fee || '', 16)}
                    ></DisplayBlockInfo>
                  </Stack>
                  {blockDetails.transactions.length - 1 !== idx ? (
                    <Divider sx={{ marginY: 1 }} variant="middle" />
                  ) : null}
                </>
              ))}
          </>
        )}
      </Box>
    </>
  );
};

export default BlockDetailsPage;
