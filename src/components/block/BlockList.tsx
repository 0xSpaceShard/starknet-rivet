import React, { useEffect, useState } from 'react';
import { RpcProvider } from 'starknet-6';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useSharedState } from '../context/context';

interface BlockInfo {
  timestamp: number;
  transactionsCount: number;
}

export const BlockList: React.FC<{
  fetchCurrentBlockNumber: () => Promise<void>;
}> = ({ fetchCurrentBlockNumber }) => {
  const context = useSharedState();
  const { url, currentBlock } = context;
  const [blockTransactionsCount, setBlockTransactionsCount] = useState<BlockInfo[]>([]);

  async function fetchTransactionsCountByBlock() {
    const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
    const newBlockTransactionsCount: BlockInfo[] = [...blockTransactionsCount];

    for (let index = newBlockTransactionsCount.length; index <= currentBlock; index++) {
      const transactionsCount = await provider.getBlockTransactionCount(index);
      const tx = await provider.getBlockWithTxs(index);

      newBlockTransactionsCount.push({ timestamp: tx.timestamp, transactionsCount });
    }
    setBlockTransactionsCount(newBlockTransactionsCount);
  }

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
  }, [currentBlock]);

  return (
    <Box padding={1}>
      {blockTransactionsCount.length === 0 ? (
        <Typography variant="caption">No transactions available.</Typography>
      ) : (
        blockTransactionsCount.reverse().map((info, index) => (
          <>
            <Stack key={index} direction="row" spacing={2}>
              <Typography variant="caption">
                Block Number {blockTransactionsCount.length - 1 - index}
              </Typography>
              <Typography variant="caption">Timestamp {info.timestamp}</Typography>
              <Typography variant="caption">Transactions {info.transactionsCount}</Typography>
            </Stack>
            {blockTransactionsCount.length - 1 !== index ? <Divider variant="middle" /> : null}
          </>
        ))
      )}
    </Box>
  );
};

export default BlockList;
