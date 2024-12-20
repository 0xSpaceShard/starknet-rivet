import { Box, Button, Divider, Stack, TextField, Typography, Container } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from '@mui/icons-material';
import { useSharedState } from '../context/context';
import {
  sendMessageToRemoveBlockInterval,
  sendMessageToSetBlockInterval,
} from '../utils/sendMessageBackground';

export enum MiningMode {
  Auto = 'AUTO',
  Transaction = 'TRANSACTION',
}

interface BlockConfigurationProps {
  createNewBlock: () => Promise<void>;
  abortBlock: (blockNumber: number) => Promise<void>;
}

export const BlockConfiguration: React.FC<BlockConfigurationProps> = ({
  createNewBlock,
  abortBlock,
}) => {
  const [newBlockInterval, setNewBlockInterval] = useState<number>(0);
  const [blockToAbort, setBlockToAbort] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAbort, setLoadingAbort] = useState<boolean>(true);
  const [errorNewInterval, setErrorNewInterval] = useState('');

  const navigate = useNavigate();
  const context = useSharedState();
  const { selectedUrl: url, currentBlock, blockInterval, setBlockInterval, configData } = context;

  const handleBack = () => {
    navigate(`/app-settings`);
  };

  const handleIntervalChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!parseInt(event.target.value, 10) || parseInt(event.target.value, 10) === 0) {
      setLoading(true);
      return;
    }
    const newInterval = parseInt(event.target.value, 10);
    if (newInterval < 60000) {
      setErrorNewInterval('Minimum Interval is 60000');
      setLoading(true);
      return;
    }
    setErrorNewInterval('');
    setNewBlockInterval(newInterval);
    setLoading(false);
  };

  const createNewInterval = () => {
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
      <Box paddingBottom={6}>
        <Stack direction={'row'} justifyContent={'flex-start'} position={'relative'}>
          <Box>
            <Button
              size="small"
              variant={'text'}
              startIcon={<ChevronLeft />}
              onClick={handleBack}
              sx={{
                padding: '8px 10px',
              }}
            >
              Back
            </Button>
          </Box>
        </Stack>
        <Container>
          <Box
            width={'100%'}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            paddingTop={1}
            paddingX={2}
          >
            <Typography variant="caption">
              {' '}
              Block Number: {currentBlock !== null ? currentBlock : 'Loading...'}
            </Typography>
            <Typography variant="caption">
              {' '}
              Interval: {blockInterval.has(url) ? blockInterval.get(url) : 'None'}
            </Typography>
          </Box>
          <Stack direction="column" spacing={2}>
            <Divider variant="middle" />
            <Typography variant="h6">Mint new Block</Typography>
            <Button variant="contained" color="primary" onClick={() => createNewBlock()}>
              {'Create Block'}
            </Button>
            <Divider variant="middle" />
            <Typography variant="h6">
              Change time interval at which a new block is minted
            </Typography>
            <TextField
              fullWidth
              label="Block interval"
              id="fullWidth"
              error={!!errorNewInterval}
              helperText={errorNewInterval}
              onChange={(e) => handleIntervalChange(e)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => createNewInterval()}
              disabled={loading}
            >
              {'Set New Block Interval'}
            </Button>
            <Divider variant="middle" />
            <Typography variant="h6">Reset Interval to none</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => resetInterval()}
              disabled={!blockInterval.has(url)}
            >
              {'Reset Block Interval'}
            </Button>
            {configData.stateArchiveCapacity === 'full' && (
              <>
                <Divider variant="middle" />
                <Typography variant="h6">Abort a block</Typography>

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
        </Container>
      </Box>
    </section>
  );
};
