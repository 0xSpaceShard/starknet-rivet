import { Button, Stack } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/context';
import PageHeader from './pageHeader';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const context = useSharedState();

  const { selectedAccount } = context;

  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}`);
  };

  const handleDeclare = () => {
    navigate(`/accounts/${selectedAccount?.address}/declare`);
  };

  const handleDeploy = () => {
    navigate(`/accounts/${selectedAccount?.address}/deploy`);
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
        </Stack>
      </PageHeader>
    </section>
  );
};
