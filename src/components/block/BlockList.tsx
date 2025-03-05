import React from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { darkTheme } from '../..';
import useGetBlocksWithTxs from '../../api/starknet/hooks/useGetBlocksWithTxs';

export const BlockList: React.FC = () => {
  const navigate = useNavigate();

  const { data, fetchNextPage, isFetching, isFetchingNextPage, hasNextPage } =
    useGetBlocksWithTxs();

  const handleClick = (index: number) => {
    navigate(`/block/${index}`);
  };

  const loading = isFetching || isFetchingNextPage;

  return (
    <section>
      <Stack marginBottom={1}>
        {!data ? (
          <Stack direction="row" justifyContent="center" paddingY={2}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            {data.pages.map((page) =>
              page.map((elem) => (
                <Box key={elem.block_number}>
                  <Button
                    variant="text"
                    sx={{
                      width: '100%',
                      textTransform: 'none',
                      color: darkTheme.palette.text.secondary,
                    }}
                    onClick={() => handleClick(elem.block_number)}
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
                        <Typography variant="subtitle2">{elem.block_number}</Typography>
                      </Stack>
                      <Stack alignItems="center" justifyContent={'space-between'} height="100%">
                        <Typography variant="caption">Timestamp</Typography>
                        <Typography variant="subtitle2">{elem.timestamp}</Typography>
                      </Stack>
                      <Stack alignItems="center" justifyContent={'space-between'} height="100%">
                        <Typography variant="caption">Transactions</Typography>
                        <Typography variant="subtitle2">{elem.transactionCount}</Typography>
                      </Stack>
                    </Stack>
                  </Button>
                </Box>
              ))
            )}
            {!loading && hasNextPage && (
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
