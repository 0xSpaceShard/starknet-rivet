import React, { useState, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, TabScrollButton, styled } from '@mui/material';
import { useSharedState } from '../context/context';
import PredeployedAccounts from '../predeployedAccounts/predeployedAccounts';
import BlockList from '../block/BlockList';
import TransactionList from '../transaction/TransactionList';
import { ContractList } from '../contract/ContractList';

export enum HomeTab {
  Accounts,
  Blocks,
  Transactions,
  Contracts,
}

const MyTabScrollButton = styled(TabScrollButton)({
  '&.Mui-disabled': {
    width: 0,
  },
  overflow: 'hidden',
  transition: 'width 0.5s',
  width: 28,
});

export const Home = () => {
  const { state } = useLocation();
  const context = useSharedState();
  const { selectedUrl: url } = context;
  const [selectedTab, setSelectedTab] = useState(state?.selectedTab ?? HomeTab.Accounts);
  const navigate = useNavigate();

  React.useEffect(() => {
    // TODO: Check if Anvil instance up and running
    if (true) navigate('/onboarding');
  }, []);

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
          onChange={(_, newValue) => setSelectedTab(newValue)}
          aria-label="Home Tabs"
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          ScrollButtonComponent={MyTabScrollButton}
        >
          <Tab sx={{ fontSize: '0.8rem' }} label="Accounts" {...a11yProps(HomeTab.Accounts)} />
          <Tab sx={{ fontSize: '0.8rem' }} label="Blocks" {...a11yProps(HomeTab.Blocks)} />
          <Tab
            sx={{ fontSize: '0.8rem' }}
            label="Transactions"
            {...a11yProps(HomeTab.Transactions)}
          />
          <Tab sx={{ fontSize: '0.8rem' }} label="Contracts" {...a11yProps(HomeTab.Contracts)} />
        </Tabs>
      </Box>
      <CustomTabPanel idx={HomeTab.Accounts}>
        <PredeployedAccounts />
      </CustomTabPanel>
      <CustomTabPanel idx={HomeTab.Blocks}>
        <BlockList />
      </CustomTabPanel>
      <CustomTabPanel idx={HomeTab.Transactions}>
        <TransactionList />
      </CustomTabPanel>
      <CustomTabPanel idx={HomeTab.Contracts}>
        <ContractList />
      </CustomTabPanel>
    </Box>
  );
};
