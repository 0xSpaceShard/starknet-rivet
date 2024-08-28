import React, { useEffect, useState } from 'react';
import { RpcProvider } from 'starknet-6';
import { Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { useSharedState } from '../context/context';
import { useNavigate } from 'react-router-dom';
import { darkTheme } from '../..';

interface BlockInfo {
  timestamp: number;
  transactionsCount: number;
}

export const BlockList: React.FC<{
  fetchCurrentBlockNumber: () => Promise<void>;
}> = ({ fetchCurrentBlockNumber }) => {
  const context = useSharedState();
  const { selectedUrl: url, currentBlock } = context;
  const navigate = useNavigate();
  const [blockTransactionsCount, setBlockTransactionsCount] = useState<BlockInfo[]>([]);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(false);
  const [endBlock, setEndBlock] = useState(0);

  async function fetchTransactionsCountByBlock() {
    const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
    const newBlockTransactionsCount: BlockInfo[] = [...blockTransactionsCount];
    setLoading(true);
    const startBlock = currentBlock - blockTransactionsCount.length;
    const endBlock = startBlock - pageSize + 1 >= 0 ? startBlock - pageSize + 1 : 0;
    setEndBlock(endBlock);
    for (let index = startBlock; index >= endBlock; index--) {
      if (index < 0) {
        break;
      }
      const transactionsCount = await provider.getBlockTransactionCount(index);
      const tx = await provider.getBlockWithTxs(index);

      newBlockTransactionsCount.push({ timestamp: tx.timestamp, transactionsCount });
    }
    setBlockTransactionsCount(newBlockTransactionsCount);
    setLoading(false);
  }

  const handleClick = (index: number) => {
    navigate(`/block/${index}`);
  };

  const handleLoadMore = () => {
    if (!loading) {
      setPageSize((prev) => prev + 15);
    }
  };

  useEffect(() => {
    const fetchCurrentBlock = async () => {
      try {
        await fetchCurrentBlockNumber();
      } catch (error) {
        console.error('Error fetching current block number:', error);
      }
    };
    fetchCurrentBlock();
  }, []);

  useEffect(() => {
    fetchTransactionsCountByBlock();
  }, [currentBlock, pageSize]);

  return (
    <Box padding={1} sx={{ height: '80vh', overflow: 'auto' }}>
      {blockTransactionsCount.length === 0 ? (
        <CircularProgress />
      ) : (
        blockTransactionsCount.map((info, index) => (
          <React.Fragment key={index}>
            <Button
              onClick={() => handleClick(currentBlock - index)}
              sx={{ cursor: 'pointer', color: darkTheme.palette.text.secondary }}
            >
              <Stack key={index} direction="row" spacing={2}>
                <Typography variant="caption">Block Number {currentBlock - index}</Typography>
                <Typography variant="caption">Timestamp {info.timestamp}</Typography>
                <Typography variant="caption">Transactions {info.transactionsCount}</Typography>
              </Stack>
            </Button>
            {currentBlock !== index ? <Divider variant="middle" /> : null}
          </React.Fragment>
        ))
      )}
      {!loading && endBlock != 0 && (
        <Button
          onClick={() => handleLoadMore()}
          size="small"
          variant="outlined"
          sx={{ cursor: 'pointer', color: darkTheme.palette.text.secondary }}
        >
          Load More
        </Button>
      )}
      {loading && blockTransactionsCount.length != 0 && <CircularProgress />}
    </Box>
  );
};

export default BlockList;
