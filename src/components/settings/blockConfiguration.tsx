import { Button, Stack, styled, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/context';
import PageHeader from './pageHeader';
import {
  sendMessageToRemoveBlockInterval,
  sendMessageToSetBlockInterval,
} from '../utils/sendMessageBackground';

interface BlockConfigurationProps {
  creatNewBlock: () => Promise<void>;
  fetchCurrentBlockNumber: () => Promise<void>;
  abortBlock: (blockNumber: number) => Promise<void>;
}

export const BlockConfiguration: React.FC<BlockConfigurationProps> = ({
  creatNewBlock,
  fetchCurrentBlockNumber,
  abortBlock,
}) => {
  const [newBlockInterval, setNewBlockInterval] = useState<number>(0);
  const [blockToAbort, setBlockToAbort] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAbort, setLoadingAbort] = useState<boolean>(true);

  const navigate = useNavigate();
  const context = useSharedState();
  const { selectedAccount, url, currentBlock, setBlockInterval, configData } = context;

  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}`);
  };

  const handleIntervalChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!parseInt(event.target.value, 10) || parseInt(event.target.value, 10) === 0) {
      setLoading(true);
      return;
    }
    const newInterval = parseInt(event.target.value, 10);
    setNewBlockInterval(newInterval);
    setLoading(false);
  };

  const creatNewInterval = () => {
    sendMessageToSetBlockInterval(url, newBlockInterval, setBlockInterval);
  };

  const resetInterval = () => {
    sendMessageToRemoveBlockInterval(url, setBlockInterval);
  };

  const abortInputBlock = () => {
    setLoadingAbort(true);
    abortBlock(blockToAbort);
  };

  const handleAbortBlockChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBlockToAbort(parseInt(event.target.value, 10));
    setLoadingAbort(false);
  };

  return (
    <section>
      <PageHeader title="Settings" backButtonHandler={handleBack}>
        <Typography variant="h6">
          Current Block Number: {currentBlock !== null ? currentBlock : 'Loading...'}
        </Typography>
        <Stack direction="column" spacing={2}>
          <Button variant="contained" color="primary" onClick={() => creatNewBlock()}>
            {'Create Block'}
          </Button>

          <TextField
            fullWidth
            label="Block interval"
            id="fullWidth"
            onChange={(e) => handleIntervalChange(e)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => creatNewInterval()}
            disabled={loading}
          >
            {'Set New Block Interval'}
          </Button>

          <Button variant="contained" color="primary" onClick={() => resetInterval()}>
            {'Reset Block Interval'}
          </Button>

          {configData.stateArchiveCapacity == 'full' && (
            <>
              <TextField
                fullWidth
                label="Block to abort"
                id="fullWidth"
                onChange={(e) => handleAbortBlockChange(e)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => abortInputBlock()}
                disabled={loadingAbort}
              >
                {'Abort Block'}
              </Button>
            </>
          )}
        </Stack>
      </PageHeader>
    </section>
  );
};
