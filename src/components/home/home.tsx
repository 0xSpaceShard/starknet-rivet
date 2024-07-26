import { useState, ReactNode } from 'react';
import { Box, Typography, Tabs, Tab, Stack, Button } from '@mui/material';
import { RpcProvider } from 'starknet-6';
import { useSharedState } from '../context/context';
import PredeployedAccounts from '../predeployedAccounts/predeployedAccounts';
import BlockList from '../block/BlockList';
import { shortenAddress } from '../utils/utils';
import { darkTheme } from '../..';

const dummyTransactionData = [
  { acc: '0x4532bdcad3492a01bafab5abb3f4b8ba49b297d13414898372a6abe51e10904', amount: 1.31 },
  { acc: '0x40cfb15b3c9cb2943ebb6b3b7fa846221a55d5c3ec71d7646989515a539938e', amount: 0.1 },
  { acc: '0x24a398a0c9bcfb0f7af3f112c43c63aa8bf67f91ec36b39793b0c338b2a9bed', amount: 2.23 },
  { acc: '0x226974140fb79ee528b7b6a23783527a76915105f786416b28f0ede0f02764b', amount: 0.01 },
  { acc: '0x5b29914c8fc3c61b33e149c2fac7705c4dafcd87e7706dd9798643d33c118f6', amount: 31.34 },
  { acc: '0x7ca26ae9818edd447df722427af88fda4b4e529e6156c63520a9e3729c2061e', amount: 22 },
  { acc: '0x53a6720c0d3ca6e79b1e35bc3882185c994b47c3ea8c8a3012202e5cb7b8fb6', amount: 0.11 },
  { acc: '0x6723910b48b49cdf421d20b1f38d822ea9a22ad982dafa6e8344a82ebf6907f', amount: 0.24 },
];

export const Home = () => {
  const context = useSharedState();
  const { selectedUrl: url, setCurrentBlock } = context;
  const [selectedTab, setSelectedTab] = useState(0);

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
            {dummyTransactionData.map((transaction, index) => (
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
                >
                  <Typography width={'70%'} whiteSpace={'nowrap'}>
                    {shortenAddress(transaction.acc)}
                  </Typography>
                  <Stack direction="row" justifyContent="flex-end" width={'30%'}>
                    {transaction.amount} ETH
                  </Stack>
                </Button>
              </Box>
            ))}
          </Stack>
        </section>
      </CustomTabPanel>
    </Box>
  );
};
