import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { logError } from '../../../background/analytics';

import OnboardingContainer from './container';

const formSchema = z.object({
  autoMine: z.boolean(),
  blockBaseFeePerGas: z.string(),
  blockTime: z.string(),
  chainId: z.string().min(1, { message: 'Required' }),
  networkName: z.string().min(1, { message: 'Required' }),
  forkBlockNumber: z.string(),
  forkUrl: z.string().min(1, { message: 'Required' }),
  gasLimit: z.string(),
  gasPrice: z.string(),
  port: z.string().min(1, { message: 'Required' }),
});

const OnboardingConfigure = () => {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      autoMine: true,
      blockBaseFeePerGas: '',
      blockTime: '',
      chainId: '1',
      networkName: 'Ethereum',
      forkBlockNumber: '',
      forkUrl: 'https://eth.merkle.io',
      gasLimit: '',
      gasPrice: '',
      port: '8545',
    },
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = form;

  const onSubmit = (values_: z.infer<typeof formSchema>) => {
    const values = {
      ...values_,
      autoMine: String(values_.autoMine),
    };

    try {
      const search = new URLSearchParams(values);
      navigate(`/l1-l2-onboarding/run?${search.toString()}`);
    } catch (error) {
      logError('Error setting local anvil instance rpc url');
    }
  };

  return (
    <OnboardingContainer
      title="Configure"
      footer={
        <Box component="div" width="100%" display="flex" gap={1} paddingY={2}>
          <Button
            fullWidth
            variant="outlined"
            type="button"
            onClick={() => navigate('/l1-l2-onboarding')}
          >
            Back
          </Button>
          <Button fullWidth variant="outlined" type="submit" form="configure-form">
            Continue
          </Button>
        </Box>
      }
    >
      <form id="configure-form" onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={3} paddingTop={1}>
          <Stack gap={2}>
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" color="GrayText">
                https://127.0.0.1:
              </Typography>
              <TextField
                {...register('port')}
                label="Port"
                error={!!errors.port}
                helperText={errors.port?.message}
              />
            </Box>
            <TextField
              {...register('chainId')}
              label="Chain Id"
              error={!!errors.chainId}
              helperText={errors.chainId?.message}
            />
            <TextField
              {...register('networkName')}
              label="Network name"
              error={!!errors.networkName}
              helperText={errors.networkName?.message}
            />
          </Stack>

          <Stack gap={2}>
            <Typography>Configure Fork</Typography>
            <TextField
              {...register('forkUrl')}
              label="RPC URL"
              error={!!errors.forkUrl}
              helperText={errors.forkUrl?.message}
            />
            <TextField
              {...register('forkBlockNumber')}
              label="Block number"
              error={!!errors.forkBlockNumber}
              helperText={errors.forkBlockNumber?.message}
            />
          </Stack>

          <Stack gap={2}>
            <Typography>Configure Blocks</Typography>
            <FormControlLabel
              control={<Checkbox {...register('autoMine')} defaultChecked />}
              label="Auto-mine transactions"
            />
            <TextField
              {...register('blockTime')}
              label="Block time (sec)"
              error={!!errors.blockTime}
              helperText={errors.blockTime?.message}
            />
            <TextField
              {...register('blockBaseFeePerGas')}
              label="Base fee (gwei)"
              error={!!errors.blockBaseFeePerGas}
              helperText={errors.blockBaseFeePerGas?.message}
            />
            <TextField
              {...register('gasPrice')}
              label="Gas price"
              error={!!errors.gasPrice}
              helperText={errors.gasPrice?.message}
            />
            <TextField
              {...register('gasLimit')}
              label="Gas limit"
              error={!!errors.gasLimit}
              helperText={errors.gasLimit?.message}
            />
          </Stack>
        </Stack>
      </form>
    </OnboardingContainer>
  );
};

export default OnboardingConfigure;
