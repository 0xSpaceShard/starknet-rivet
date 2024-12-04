import React, { useEffect, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async (latestBlockIdx: number) => {
    setIsLoading(true);
    const data: any[] = await fetchTransactionDetailsForLatestBlocks(latestBlockIdx);
    setBlockDetailsList(data.filter((block) => block?.transactions?.length));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions(currentBlock);
  }, [currentBlock]);

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
              blockDetailsList.map((blockDetails, idx) => (
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
              ))
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
