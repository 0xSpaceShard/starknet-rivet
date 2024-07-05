import { Button, Stack } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/context';
import PageHeader from './pageHeader';

export const Settings: React.FC = () => {
  const { selectedAccount } = useSharedState();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}`);
  };

  const handleDeclare = () => {
    navigate(`/accounts/${selectedAccount?.address}/declare`);
  };

  const handleDeploy = () => {
    navigate(`/accounts/${selectedAccount?.address}/deploy`);
  };

  const handleBlockConfiguration = () => {
    navigate(`/accounts/${selectedAccount?.address}/blockConfiguration`);
  };

  return (
    <section>
      <PageHeader title="Settings" backButtonHandler={handleBack}>
        <Stack
          direction={'column'}
          spacing={2}
          sx={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '300px' }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleDeclare()}
            sx={{ width: '100%' }}
          >
            Declare smart contract
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleDeploy()}
            sx={{ width: '100%' }}
          >
            Deploy smart contract
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleBlockConfiguration()}
            sx={{ width: '100%' }}
          >
            Block configuration
          </Button>
        </Stack>
      </PageHeader>
    </section>
  );
};
