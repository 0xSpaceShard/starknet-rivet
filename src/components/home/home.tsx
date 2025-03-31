import React, { useState, ReactNode } from 'react';
import * as starknet from 'starknet';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, TabScrollButton, styled } from '@mui/material';
import { useSharedState } from '../context/context';
import PredeployedAccounts from '../predeployedAccounts/predeployedAccounts';
import BlockList from '../block/BlockList';
import TransactionList from '../transaction/TransactionList';
import { ContractList } from '../contract/ContractList';
import useLoad from '../../api/starknet/hooks/useLoad';
// import useSendMsgToL2 from '../../api/starknet/hooks/useSendMsgToL2';
// import useConsumeMsgFromL2 from '../../api/starknet/hooks/useConsumeMsgFromL2';
import useFlush from '../../api/starknet/hooks/useFlush';
import l1_l2Contract from '../../l1_l2.json';
import { useRpcProviderState } from '../../context/rpcProvider/RpcProviderContext';

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
  const { selectedUrl: url, selectedAccount } = context;
  const [selectedTab, setSelectedTab] = useState(state?.selectedTab ?? HomeTab.Accounts);
  const { rpcProvider } = useRpcProviderState();

  const { mutateAsync: load } = useLoad();
  // const { mutateAsync: sendMessageToL2 } = useSendMsgToL2();
  // const { mutateAsync: consumeMessageFromL2 } = useConsumeMsgFromL2();
  const { mutateAsync: flush } = useFlush();

  React.useEffect(() => {
    (async () => {
      // 1. Load the L1 messaging contract
      const contractAddress = await load();

      if (contractAddress && selectedAccount && rpcProvider) {
        // 2. Send a message from L1 to L2
        // await sendMessageToL2({
        //   entryPointSelector: '0xC73F681176FC7B3F9693986FD7B14581E8D540519E27400E88B8713932BE01',
        //   l2ContractAddress: '0x66502d7c4655de7fc12b98d2cde1a74a88c1462ba56018d84b6a2fa0dc4bdd9',
        //   l1ContractAddress: contractAddress,
        //   payload: ['0x1', '0x2'],
        // });

        // 3. Initiate message from L2 to L1
        try {
          const l2Account = new starknet.Account(
            rpcProvider as any,
            selectedAccount.address,
            selectedAccount.private_key
          );

          const l2Contract = new starknet.Contract(
            l1_l2Contract.abi,
            '0x18875170bf14bef4650670471ad0d647ee29e7bf303736660b3d0f4dc0084a0',
            rpcProvider as any
          );
          l2Contract.connect(l2Account);

          const user = 1n;
          const incrementAmount = 10_000_000n;
          await l2Contract.increase_balance(user, incrementAmount);
          console.log('Increased Balance!');

          const withdrawAmount = 10n;
          const withdrawTx = await l2Contract.withdraw(user, withdrawAmount);
          console.log('Withdrawn!', { withdrawTx });
          await rpcProvider?.waitForTransaction(withdrawTx.transaction_hash);
        } catch (error) {
          console.log(error);
          return;
        }

        // 4. Consume a message from L2 to L1
        // console.log('Consuming...');
        // await consumeMessageFromL2({
        //   fromAddress: '0x66502d7c4655de7fc12b98d2cde1a74a88c1462ba56018d84b6a2fa0dc4bdd9',
        //   toAddress: contractAddress,
        //   payload: ['0x0', '0x1', '0x3e8'],
        // });

        // 5. Flush the message queue to process all messages
        console.log('Flushing...');
        await flush();
      }
    })();
  }, [selectedAccount, rpcProvider]);

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
