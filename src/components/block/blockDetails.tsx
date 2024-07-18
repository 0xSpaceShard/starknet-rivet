import React, { useEffect, useState } from 'react';
import { RpcProvider } from 'starknet-6';
import { Box, Button, Divider, Grid, Stack, Typography } from '@mui/material';
import { useSharedState } from '../context/context';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from '@mui/icons-material';
import { shortenAddress } from '../utils/utils';
import { darkTheme } from '../..';

const BlockDetailsPage: React.FC = () => {
  const context = useSharedState();
  const navigate = useNavigate();
  const { url, blockDetails, setBlockDetails } = context;
  const { blockIndex } = useParams<{ blockIndex: string }>();
  const index = parseInt(blockIndex || '', 10);

  async function fetchTransactionsCountByBlock() {
    const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
    const tx = await provider.getBlockWithTxs(index);
    setBlockDetails(tx);
  }

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchTransactionsCount = async () => {
      try {
        await fetchTransactionsCountByBlock();
      } catch (error) {
        console.error('Error fetching current block number:', error);
      }
    };
    fetchTransactionsCount();
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
      <Box padding={1} flexGrow={1}>
        <Stack direction={'row'} spacing={{ xs: 3, sm: 2 }} useFlexGap flexWrap="wrap">
          <Stack alignItems={'flex-start'}>
            <Typography color={darkTheme.palette.text.secondary} variant="caption">
              Block Number
            </Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Typography fontSize={'0.9rem'}>{blockDetails.block_number}</Typography>
            </Stack>
          </Stack>
          <Stack alignItems={'flex-start'}>
            <Typography color={darkTheme.palette.text.secondary} variant="caption">
              Block Hash
            </Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Typography fontSize={'0.9rem'}>
                {shortenAddress(blockDetails.block_hash, 5)}
              </Typography>
            </Stack>
          </Stack>
          <Stack alignItems={'flex-start'}>
            <Typography color={darkTheme.palette.text.secondary} variant="caption">
              Timestamp
            </Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Typography fontSize={'0.9rem'}>{blockDetails.timestamp ?? 'Unknown'}</Typography>
            </Stack>
          </Stack>
          <Stack alignItems={'flex-start'}>
            <Typography color={darkTheme.palette.text.secondary} variant="caption">
              Starknet Version
            </Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Typography fontSize={'0.9rem'}>
                {blockDetails.starknet_version ?? 'Unknown'}
              </Typography>
            </Stack>
          </Stack>
          <Stack alignItems={'flex-start'}>
            <Typography color={darkTheme.palette.text.secondary} variant="caption">
              Status
            </Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Typography fontSize={'0.9rem'}>{blockDetails.status ?? 'Unknown'}</Typography>
            </Stack>
          </Stack>
        </Stack>
        {blockDetails.transactions && blockDetails.transactions.length > 0 && (
          <>
            <Divider sx={{ marginY: 3 }} variant="middle" />
            <Stack alignItems={'flex-start'}>
              <Typography color={darkTheme.palette.text.secondary} variant="h6" marginY={1}>
                Transactions
              </Typography>
            </Stack>
            {blockDetails.transactions.map((info: any, index: number) => (
              <Stack direction={'row'} spacing={{ xs: 2, sm: 2 }} useFlexGap flexWrap="wrap">
                <Stack alignItems={'flex-start'}>
                  <Typography color={darkTheme.palette.text.secondary} variant="caption">
                    Hash
                  </Typography>
                  <Stack direction={'row'} alignItems={'center'} spacing={1}>
                    <Typography fontSize={'0.9rem'}>
                      {shortenAddress(info.transaction_hash, 5)}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack alignItems={'flex-start'}>
                  <Typography color={darkTheme.palette.text.secondary} variant="caption">
                    Sender
                  </Typography>
                  <Stack direction={'row'} alignItems={'center'} spacing={1}>
                    <Typography fontSize={'0.9rem'}>
                      {shortenAddress(info.sender_address, 5)}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack alignItems={'flex-start'}>
                  <Typography color={darkTheme.palette.text.secondary} variant="caption">
                    Nonce
                  </Typography>
                  <Stack direction={'row'} alignItems={'center'} spacing={1}>
                    <Typography fontSize={'0.9rem'}>{info.nonce}</Typography>
                  </Stack>
                </Stack>
                <Stack alignItems={'flex-start'}>
                  <Typography color={darkTheme.palette.text.secondary} variant="caption">
                    Max Fee
                  </Typography>
                  <Stack direction={'row'} alignItems={'center'} spacing={1}>
                    <Typography fontSize={'0.9rem'}>{parseInt(info.max_fee || '', 16)}</Typography>
                  </Stack>
                </Stack>
                {blockDetails.length - 1 !== index ? <Divider variant="middle" /> : null}
              </Stack>
            ))}
          </>
        )}
      </Box>
    </>
  );
};

export default BlockDetailsPage;
