import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { darkTheme } from '../..';
import { shortenAddress } from '../utils/utils';
import { Transaction } from '../../api/starknet/types';
import useGetBlocksWithTxs from '../../api/starknet/hooks/useGetBlocksWithTxs';

export const TransactionList: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: blocks,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetBlocksWithTxs(1);

  const isLoading = isFetching || isFetchingNextPage;

  const transactionDetails = async (transaction: Transaction) => {
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
            {blocks && blocks.pages.length > 0 ? (
              <>
                {blocks.pages.map((page) =>
                  page.map((elem) => (
                    <Box key={elem.block_hash}>
                      {elem.transactions && elem.transactions.length > 0
                        ? elem.transactions
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
                                      blockNumber: elem.block_number,
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
                )}

                {hasNextPage ? (
                  <Box padding={2}>
                    <Button
                      onClick={() => fetchNextPage()}
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
