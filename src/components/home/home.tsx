import { useState, useEffect, ReactNode } from 'react';
import { Box, Typography, Tabs, Tab, Stack, Button } from '@mui/material';
import { RpcProvider } from 'starknet-6';
import { useSharedState } from '../context/context';
import PredeployedAccounts from '../predeployedAccounts/predeployedAccounts';
import BlockList from '../block/BlockList';
import { handleCopyAddress, shortenAddress } from '../utils/utils';
import { useFetchTransactionsDetails } from '../hooks/hooks';
import { darkTheme } from '../..';

export const Home = () => {
  const context = useSharedState();
  const {
    selectedUrl: url,
    currentBlock,
    setCurrentBlock,
    blockDetails,
    selectedAccount,
  } = context;
  const [selectedTab, setSelectedTab] = useState(0);

  const { fetchTransactionsDetailsByBlock } = useFetchTransactionsDetails();

  useEffect(() => {
    fetchTransactionsDetailsByBlock(currentBlock);
  }, [fetchTransactionsDetailsByBlock, currentBlock]);

  async function fetchCurrentBlockNumber() {
    try {
      const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
      const blockNumber = await provider.getBlockNumber();
      setCurrentBlock(blockNumber);
    } catch (error) {
      console.error('Error fetching block number:', error);
    }
  }

  const a11yProps = (index: number) => ({
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

  const CustomTabPanel: React.FC<{ idx: number; children: ReactNode }> = ({ idx, children }) => {
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
          <Tab sx={{ fontSize: '0.8rem' }} label="Accounts" {...a11yProps(0)} />
          <Tab sx={{ fontSize: '0.8rem' }} label="Blocks" {...a11yProps(1)} />
          <Tab sx={{ fontSize: '0.8rem' }} label="Transactions" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel idx={0}>
        <PredeployedAccounts />
      </CustomTabPanel>
      <CustomTabPanel idx={1}>
        <BlockList fetchCurrentBlockNumber={fetchCurrentBlockNumber} />
      </CustomTabPanel>
      <CustomTabPanel idx={2}>
        <section>
          <Stack marginBottom={1}>
            {blockDetails.transactions &&
              blockDetails.transactions.length > 0 &&
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
                            handleCopyAddress(info.transaction_hash);
                          }}
                        >
                          <Typography width={'70%'} whiteSpace={'nowrap'}>
                            {shortenAddress(info.transaction_hash)}
                          </Typography>
                        </Button>
                      </Box>
                    </>
                  ) : null
                )}
          </Stack>
        </section>
      </CustomTabPanel>
    </Box>
  );
};
