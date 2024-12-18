import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useSharedState } from '../context/context';
import { useFetchTransactionsDetails } from '../hooks/hooks';
import { darkTheme } from '../..';
import { shortenAddress } from '../utils/utils';

export const TransactionList: React.FC = () => {
  const navigate = useNavigate();
  const { currentBlock } = useSharedState();
  const { fetchTransactionDetailsForLatestBlocks } = useFetchTransactionsDetails();
  const [blockDetailsList, setBlockDetailsList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    const endBlockIndex = currentBlock - (page - 1) * pageSize;
    const data: any[] = await fetchTransactionDetailsForLatestBlocks(endBlockIndex, pageSize);
    const blockDetailsFetched = data.filter((block) => block?.transactions?.length);
    setBlockDetailsList([...blockDetailsList, ...blockDetailsFetched]);
    setIsLoading(false);
  }, [currentBlock, page]);

  useEffect(() => {
    fetchTransactions();
  }, [currentBlock, page]);

  const transactionDetails = async (transaction: any) => {
    if (!transaction) return;
    navigate(`/transaction/${transaction.transaction_hash}`, { state: { transaction } });
  };

  return (
    <section>
      <Stack marginBottom={1}>
        {isLoading ? (
          <Stack direction="row" justifyContent="center" paddingY={2}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            {blockDetailsList.length ? (
              <>
                {blockDetailsList.map((blockDetails, idx) => (
                  <Box key={idx}>
                    {blockDetails.transactions && blockDetails.transactions.length > 0
                      ? blockDetails.transactions
                          .slice()
                          .reverse()
                          .map((info: any, index: number) => (
                            <Box key={index}>
                              <Button
                                fullWidth
                                variant="text"
                                sx={{
                                  justifyContent: 'flex-start',
                                  paddingLeft: 5,
                                  paddingRight: 2,
                                  textTransform: 'none',
                                  paddingY: 1,
                                  color: darkTheme.palette.text.secondary,
                                }}
                                onClick={() => {
                                  transactionDetails({
                                    blockNumber: blockDetails.block_number,
                                    ...info,
                                  });
                                }}
                              >
                                <Typography whiteSpace={'nowrap'}>
                                  {shortenAddress(info.transaction_hash, 14)}
                                </Typography>
                              </Button>
                            </Box>
                          ))
                      : null}
                  </Box>
                ))}
                {currentBlock - page * pageSize >= 0 ? (
                  <Box padding={2}>
                    <Button
                      onClick={() => setPage(page + 1)}
                      size="small"
                      variant="text"
                      sx={{ cursor: 'pointer' }}
                    >
                      Load More
                    </Button>
                  </Box>
                ) : null}
              </>
            ) : (
              <Typography variant="caption">No Transactions</Typography>
            )}
          </>
        )}
      </Stack>
    </section>
  );
};

export default TransactionList;
