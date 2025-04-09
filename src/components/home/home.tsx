import React, { useState, ReactNode } from 'react';
import * as starknet from 'starknet';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, TabScrollButton, styled } from '@mui/material';
import { useSharedState } from '../context/dataContext';
import PredeployedAccounts from '../predeployedAccounts/predeployedAccounts';
import BlockList from '../block/BlockList';
import TransactionList from '../transaction/TransactionList';
import { ContractList } from '../contract/ContractList';
import useLoad from '../../api/starknet/hooks/useLoad';
import useConsumeMsgFromL2 from '../../api/starknet/hooks/useConsumeMsgFromL2';
import useFlush from '../../api/starknet/hooks/useFlush';
import l1_l2Contract from '../../l1_l2.json';
import { useRpcProviderState } from '../../context/rpcProvider/RpcProviderContext';
import { numericToHexString } from '../utils/utils';

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
  const { mutateAsync: consumeMessageFromL2 } = useConsumeMsgFromL2();
  const { mutateAsync: flush } = useFlush();

  React.useEffect(() => {
    (async () => {
      const contractAddress = await load();

      // NOTE: example taken from https://github.com/0xSpaceShard/starknet-devnet-js/blob/master/test/l1-l2-postman.test.ts
      if (contractAddress && selectedAccount && rpcProvider) {
        try {
          const l2Account = new starknet.Account(
            rpcProvider as any,
            selectedAccount.address,
            selectedAccount.private_key,
            undefined,
            starknet.constants.TRANSACTION_VERSION.V3
          );

          const l2Contract = new starknet.Contract(
            l1_l2Contract.abi,
            '0x7edd24723923e6518b8f84c1599be0dca57b3f1c6b1ee95148761fa625ae66d',
            rpcProvider as any
          );
          l2Contract.connect(l2Account);

          const user = 1n;
          const incrementAmount = 10_000_000n;
          await l2Contract.increase_balance(user, incrementAmount);

          const withdrawAmount = 10n;
          const withdrawTx = await l2Contract.withdraw(user, withdrawAmount, contractAddress);
          await rpcProvider?.waitForTransaction(withdrawTx.transaction_hash);

          const { message_hash } = await consumeMessageFromL2({
            fromAddress: l2Contract.address,
            toAddress: contractAddress,
            payload: ['0x0', numericToHexString(user), numericToHexString(withdrawAmount)],
          });

          console.log('Success!', message_hash);

          await flush();
        } catch (error) {
          console.log(error);
        }
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
