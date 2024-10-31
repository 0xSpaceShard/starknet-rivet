import { useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Stack, Button } from '@mui/material';
import { useSharedState } from '../context/context';
import PredeployedAccounts from '../predeployedAccounts/predeployedAccounts';
import BlockList from '../block/BlockList';
import { handleCopyToClipboard, shortenAddress } from '../utils/utils';
import { useFetchTransactionsDetails } from '../hooks/hooks';
import { darkTheme } from '../..';

export enum HomeTab {
  Accounts,
  Blocks,
  Transactions,
}

export const Home = () => {
  const { state } = useLocation();
  const context = useSharedState();
  const { selectedUrl: url, currentBlock, blockDetails, selectedAccount } = context;
  const [selectedTab, setSelectedTab] = useState(state?.selectedTab ?? HomeTab.Accounts);

  const { fetchTransactionsDetailsByBlock } = useFetchTransactionsDetails();

  useEffect(() => {
    fetchTransactionsDetailsByBlock(currentBlock);
  }, [fetchTransactionsDetailsByBlock, currentBlock]);

  const a11yProps = (index: HomeTab) => ({
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  });

  if (!url) {
    return (
      <Box height={48} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Typography variant="caption">Not connected</Typography>
      </Box>
    );
  }

  const CustomTabPanel: React.FC<{ idx: HomeTab; children: ReactNode }> = ({ idx, children }) => {
    return (
      <div
        role="tabpanel"
        hidden={selectedTab !== idx}
        id={`simple-tabpanel-${idx}`}
        aria-labelledby={`simple-tab-${idx}`}
      >
        {selectedTab === idx && <Box sx={{ pt: 1 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 0.1, borderColor: 'divider' }}>
        <Tabs
          centered
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          aria-label="Home Tabs"
        >
          <Tab sx={{ fontSize: '0.8rem' }} label="Accounts" {...a11yProps(HomeTab.Accounts)} />
          <Tab sx={{ fontSize: '0.8rem' }} label="Blocks" {...a11yProps(HomeTab.Blocks)} />
          <Tab
            sx={{ fontSize: '0.8rem' }}
            label="Transactions"
            {...a11yProps(HomeTab.Transactions)}
          />
        </Tabs>
      </Box>
      <CustomTabPanel idx={HomeTab.Accounts}>
        <PredeployedAccounts />
      </CustomTabPanel>
      <CustomTabPanel idx={HomeTab.Blocks}>
        <BlockList />
      </CustomTabPanel>
      <CustomTabPanel idx={HomeTab.Transactions}>
        <section>
          <Stack marginBottom={1}>
            {blockDetails.transactions && blockDetails.transactions.length > 0 ? (
              blockDetails.transactions
                .slice()
                .reverse()
                .map((info: any, index: number) =>
                  info.sender_address === selectedAccount?.address ? (
                    <>
                      <Box key={index}>
                        <Button
                          fullWidth
                          variant="text"
                          sx={{
                            textTransform: 'none',
                            paddingY: 1,
                            paddingX: 2,
                            color: darkTheme.palette.text.secondary,
                          }}
                          onClick={() => {
                            handleCopyToClipboard(info.transaction_hash);
                          }}
                        >
                          <Typography width={'70%'} whiteSpace={'nowrap'}>
                            {shortenAddress(info.transaction_hash)}
                          </Typography>
                        </Button>
                      </Box>
                    </>
                  ) : null
                )
            ) : (
              <Typography variant="caption">No Transactions</Typography>
            )}
          </Stack>
        </section>
      </CustomTabPanel>
    </Box>
  );
};
