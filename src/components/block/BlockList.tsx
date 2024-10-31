import React, { useEffect, useState, useCallback } from 'react';
import { RpcProvider } from 'starknet-6';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/context';
import { darkTheme } from '../..';

interface BlockInfo {
  blockNumber: number;
  timestamp: number;
  transactionsCount: number;
}

export const BlockList: React.FC = () => {
  const context = useSharedState();
  const { selectedUrl: url, currentBlock } = context;
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<BlockInfo[]>([]);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(false);
  const [endBlock, setEndBlock] = useState(0);

  const fetchTransactionsCountByBlock = useCallback(async () => {
    setLoading(true);
    const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
    const start = currentBlock - blocks.length;
    const end = start - pageSize + 1 >= 0 ? start - pageSize + 1 : 0;
    setEndBlock(end);
    for (let index = start; index >= end; index--) {
      if (index < 0) {
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      const transactionsCount = await provider.getBlockTransactionCount(index);
      // eslint-disable-next-line no-await-in-loop
      const block = (await provider.getBlockWithTxs(index)) as any;

      blocks.push({
        blockNumber: block.block_number,
        timestamp: block.timestamp,
        transactionsCount,
      });
    }
    setBlocks(blocks);
    setLoading(false);
  }, [currentBlock, blocks]);

  const handleClick = (index: number) => {
    navigate(`/block/${index}`);
  };

  const handleLoadMore = () => {
    if (!loading) {
      setPageSize((prev) => prev + 15);
    }
  };

  useEffect(() => {
    fetchTransactionsCountByBlock();
  }, [currentBlock, pageSize]);

  return (
    <section>
      <Stack marginBottom={1}>
        {blocks.length === 0 ? (
          <Stack direction="row" justifyContent="center" paddingY={2}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            {blocks.map((info, index) => (
              <Box key={index}>
                <Button
                  variant="text"
                  sx={{
                    width: '100%',
                    textTransform: 'none',
                    color: darkTheme.palette.text.secondary,
                  }}
                  onClick={() => handleClick(currentBlock - index)}
                >
                  <Stack
                    width="100%"
                    direction="row"
                    spacing={2}
                    paddingX={1}
                    justifyContent={'space-between'}
                  >
                    <Stack alignItems="center" justifyContent={'space-between'} height="100%">
                      <Typography variant="caption">Block Number</Typography>
                      <Typography variant="subtitle2">{currentBlock - index}</Typography>
                    </Stack>
                    <Stack alignItems="center" justifyContent={'space-between'} height="100%">
                      <Typography variant="caption">Timestamp</Typography>
                      <Typography variant="subtitle2">{info.timestamp}</Typography>
                    </Stack>
                    <Stack alignItems="center" justifyContent={'space-between'} height="100%">
                      <Typography variant="caption">Transactions</Typography>
                      <Typography variant="subtitle2">{info.transactionsCount}</Typography>
                    </Stack>
                  </Stack>
                </Button>
              </Box>
            ))}
            {!loading && !!endBlock && (
              <Box padding={2}>
                <Button
                  onClick={() => handleLoadMore()}
                  size="small"
                  variant="text"
                  sx={{ cursor: 'pointer' }}
                >
                  Load More
                </Button>
              </Box>
            )}
            {loading && (
              <Stack direction="row" justifyContent="center" paddingY={2}>
                <CircularProgress size={20} />
              </Stack>
            )}
          </>
        )}
      </Stack>
    </section>
  );
};

export default BlockList;
