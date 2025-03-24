import React, { useState, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, TabScrollButton, styled } from '@mui/material';
import { useSharedState } from '../context/context';
import PredeployedAccounts from '../predeployedAccounts/predeployedAccounts';
import BlockList from '../block/BlockList';
import TransactionList from '../transaction/TransactionList';
import { ContractList } from '../contract/ContractList';
import useLoad from '../../api/starknet/hooks/useLoad';
import useSendMsgToL2 from '../../api/starknet/hooks/useSendMsgToL2';
import useConsumeMsgFromL2 from '../../api/starknet/hooks/useConsumeMsgFromL2';
import useFlush from '../../api/starknet/hooks/useFlush';

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
  const { selectedUrl: url, onboarded } = context;
  const [selectedTab, setSelectedTab] = useState(state?.selectedTab ?? HomeTab.Accounts);
  const navigate = useNavigate();

  const { mutateAsync: load } = useLoad();
  const { mutateAsync: sendMessageToL2 } = useSendMsgToL2();
  const { mutateAsync: consumeMessageFromL2 } = useConsumeMsgFromL2();
  const { mutateAsync: flush } = useFlush();

  React.useEffect(() => {
    if (!onboarded) navigate('/onboarding');
    else {
      (async () => {
        // 1. Load the L1 messaging contract
        const contractAddress = await load();

        if (contractAddress) {
          // 2. Send a message from L1 to L2
          await sendMessageToL2({
            l2ContractAddress: '0x5b6947dc313a13fe6a60fa1471aa3f41e8eb4aa2d172f7a03e6c7a76ddfb132',
            entryPointSelector: '0xC73F681176FC7B3F9693986FD7B14581E8D540519E27400E88B8713932BE01',
            l1ContractAddress: contractAddress,
            payload: ['0x1', '0x2'],
          });

          // 3. Consume a message from L2 to L1
          await consumeMessageFromL2({
            fromAddress: '0x5b6947dc313a13fe6a60fa1471aa3f41e8eb4aa2d172f7a03e6c7a76ddfb132',
            toAddress: contractAddress,
            payload: ['0x0', '0x1', '0x2'],
          });

          // 4. Flush the message queue to process all messages
          await flush();
        }
      })();
    }
  }, [onboarded]);

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
