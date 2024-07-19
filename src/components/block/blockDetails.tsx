import React, { useEffect } from 'react';
import { RpcProvider } from 'starknet-6';
import { Box, Button, Divider, Grid, Stack, Typography } from '@mui/material';
import { useSharedState } from '../context/context';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from '@mui/icons-material';
import { shortenAddress } from '../utils/utils';
import { darkTheme } from '../..';
import DisplayBlockInfo from './displayBlockInfo';

const BlockDetailsPage: React.FC = () => {
  const context = useSharedState();
  const navigate = useNavigate();
  const { url, blockDetails, setBlockDetails } = context;
  const { blockIndex } = useParams<{ blockIndex: string }>();
  const index = parseInt(blockIndex || '', 10);

  async function fetchTransactionsDetailsByBlock() {
    const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
    const tx = await provider.getBlockWithTxs(index);
    setBlockDetails(tx);
  }

  const handleBack = () => {
    // TODO: Update to navigate to the second tab on the home screen where the blocks are.
    navigate('/');
  };

  useEffect(() => {
    const fetchTransactionsDetails = async () => {
      try {
        await fetchTransactionsDetailsByBlock();
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
      <Box padding={1} flexGrow={1}>
        <Stack direction={'row'} spacing={{ xs: 2, sm: 2 }} useFlexGap flexWrap="wrap">
          <DisplayBlockInfo
            title="Block Number"
            value={blockDetails.block_number}
          ></DisplayBlockInfo>
          <DisplayBlockInfo
            title="Block Hash"
            value={shortenAddress(blockDetails.block_hash, 5)}
          ></DisplayBlockInfo>
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
            <Divider sx={{ marginY: 3 }} variant="middle" />
            <Stack alignItems={'flex-start'}>
              <Typography color={darkTheme.palette.text.secondary} variant="h6" marginY={1}>
                Transactions
              </Typography>
            </Stack>
            {blockDetails.transactions.map((info: any, index: number) => (
              <Stack direction={'row'} spacing={{ xs: 2, sm: 2 }} useFlexGap flexWrap="wrap">
                <DisplayBlockInfo
                  title="Hash"
                  value={shortenAddress(info.transaction_hash, 5)}
                ></DisplayBlockInfo>
                <DisplayBlockInfo
                  title="Sender"
                  value={shortenAddress(info.sender_address, 5)}
                ></DisplayBlockInfo>
                <DisplayBlockInfo title="Nonce" value={info.nonce}></DisplayBlockInfo>
                <DisplayBlockInfo
                  title="Max Fee"
                  value={parseInt(info.max_fee || '', 16)}
                ></DisplayBlockInfo>
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
