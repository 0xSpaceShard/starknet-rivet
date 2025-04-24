import React from 'react';
import { z } from 'zod';
import * as starknet from 'starknet';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import OnboardingContainer from './container';
import { useSharedState } from '../../context/dataContext';
import useLoad from '../../../api/starknet/hooks/useLoad';
import useFlush from '../../../api/starknet/hooks/useFlush';
import { logError } from '../../../background/analytics';
import { getSelectedAccount } from '../../../background/utils';

const formSchema = z.object({
  l1L2MessagingContractAddress: z.string().min(1, { message: 'Required' }),
  l1L2MessagingContractClassHash: z.string(),
  l1L2MessagingContractAbi: z
    .instanceof(File)
    .refine((file) => ['application/json'].includes(file.type), {
      message: `Invalid document file type`,
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should not exceed 5MB',
    }),
  l1ContractAddress: z.string().min(1, { message: 'Required' }),
});

const l1L2Data = () => {
  const [rpcError, setRpcError] = React.useState('');
  const [checkSierra, setCheckSierra] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const { selectedUrl } = useSharedState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      l1L2MessagingContractAbi: undefined,
      l1L2MessagingContractClassHash: '',
      l1L2MessagingContractAddress: '',
      l1ContractAddress: '',
    },
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
  } = form;

  const { mutateAsync: load } = useLoad();
  const { mutateAsync: flush } = useFlush();

  const onSubmit = async () => {
    try {
      await flush();
    } catch (error) {
      logError('l1 l2 messaging flush error:', error);
    }
  };

  const generateContract = async () => {
    const file = form.getValues('l1L2MessagingContractAbi');
    const classHash = form.getValues('l1L2MessagingContractClassHash');
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        try {
          setIsLoading(true);
          const json = JSON.parse(content);
          const isValidSierra = starknet.isSierra(json);
          setCheckSierra(isValidSierra);

          if (isValidSierra) {
            const acc = await getSelectedAccount();
            const data = await acc.declareAndDeploy({
              contract: json as starknet.CompiledContract,
              compiledClassHash:
                classHash || '0x02548c46a426421b5156ebbdd9a1ee0a32ec4588af5c9a68d636725cfa11d300',
            });

            form.setValue('l1L2MessagingContractAddress', data.deploy.contract_address);
          }
        } catch (error) {
          logError('Contract generation error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSierraFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    if (file.type === 'application/json') {
      form.setValue('l1L2MessagingContractAbi', file);
    } else {
      logError('Invalid file type. Please upload a JSON file.');
    }
  };

  React.useEffect(() => {
    if (selectedUrl.includes('devnet')) setRpcError('Switch to local/forked devnet');
  }, [selectedUrl]);

  return (
    <OnboardingContainer
      title="Run"
      subtitle="Fill out the necessary data"
      footer={
        <Box component="div" width="100%" display="flex" gap={1} paddingY={2}>
          <Button
            fullWidth
            variant="outlined"
            type="submit"
            form="data-form"
            disabled={!!rpcError || isLoading}
          >
            Flush
          </Button>
        </Box>
      }
    >
      <Stack direction="column" gap={2} width="100%">
        {rpcError && (
          <Box
            component="div"
            display="flex"
            width="100%"
            justifyContent="center"
            alignItems="center"
          >
            <Typography color="red">{rpcError}</Typography>
          </Box>
        )}
        <form
          id="data-form"
          onSubmit={handleSubmit(onSubmit)}
          style={{
            width: '100%',
          }}
        >
          <Stack gap={2} paddingTop={1} width="100%">
            <Stack gap={2}>
              <TextField
                {...register('l1L2MessagingContractClassHash')}
                label="Messaging Contract Class Hash (optional)"
                error={!!errors.l1L2MessagingContractClassHash}
                helperText={errors.l1L2MessagingContractClassHash?.message}
                disabled={!!rpcError || isLoading}
              />
              <Controller
                name="l1L2MessagingContractAbi"
                control={control}
                render={({ field: { ref, name } }) => {
                  return (
                    <Stack direction="column" gap={1}>
                      <Typography>Upload L1 L2 Contract Sierra</Typography>
                      {!checkSierra && (
                        <Typography color="error" variant="body2">
                          Invalid Sierra JSON file. Please upload a valid Sierra JSON file.
                        </Typography>
                      )}
                      {errors.l1L2MessagingContractAbi && (
                        <Typography color="error" variant="body2">
                          {errors.l1L2MessagingContractAbi.message}
                        </Typography>
                      )}
                      <input
                        name={name}
                        type="file"
                        ref={ref}
                        accept=".json"
                        onChange={handleSierraFileUpload}
                        disabled={!!rpcError || isLoading}
                      />
                    </Stack>
                  );
                }}
              />
              <Button
                onClick={generateContract}
                disabled={!!rpcError || isLoading}
                variant="outlined"
              >
                Generate Contract
              </Button>
            </Stack>

            <Box
              width="100%"
              bgcolor="lightgray"
              minHeight="1px"
              height="1px"
              sx={{
                opacity: '30%',
              }}
            />

            <TextField
              {...register('l1L2MessagingContractAddress')}
              label="Messaging Contract Address"
              error={!!errors.l1L2MessagingContractAddress}
              helperText={errors.l1L2MessagingContractAddress?.message}
              disabled={!!rpcError || isLoading}
            />
            <Box
              component="div"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
            >
              <TextField
                {...register('l1ContractAddress')}
                label="L1 Contract Address (optional)"
                error={!!errors.l1ContractAddress}
                helperText={errors.l1ContractAddress?.message}
                disabled={!!rpcError || isLoading}
                fullWidth
              />
              <Button
                onClick={async () => {
                  setIsLoading(true);
                  const l1ContractAddress = await load(
                    form.getValues('l1ContractAddress') || undefined
                  );
                  form.setValue('l1ContractAddress', l1ContractAddress as string);
                  setIsLoading(false);
                }}
                disabled={!!rpcError || isLoading}
              >
                Load
              </Button>
            </Box>
          </Stack>
        </form>
      </Stack>
    </OnboardingContainer>
  );
};

export default l1L2Data;
