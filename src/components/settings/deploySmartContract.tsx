import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Abi } from 'starknet-6';
import { useSharedState } from '../context/context';
import PageHeader from './pageHeader';
import AddressTooltip from '../addressTooltip/addressTooltip';
import { useDeployedContracts } from '../hooks/useDeployedContracts';
import { logError } from '../../background/analytics';
import { useProviderState } from '../../context/provider/ProviderContext';

interface AbiEntry {
  name?: string;
  type: string;
  inputs?: { name: string; type: string }[];
}

interface ConstructorParam {
  name: string;
  type: string;
  value: any;
}

export const DeploySmartContract: React.FC = () => {
  const context = useSharedState();
  const {
    selectedAccount,
    declaredClassHash,
    deployedContractAddress,
    setDeployedContractAddress,
  } = context;
  const { provider } = useProviderState();

  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedClassHash, setSelectedClassHash] = useState(declaredClassHash || '');
  const [errorDeployment, setErrorDeployment] = useState('');

  const [constructorParams, setConstructorParams] = useState<ConstructorParam[]>([]);

  const { update: saveDeployedContract } = useDeployedContracts();

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}`);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedClassHash(event.target.value);
  };

  const handleParamChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newParams = [...constructorParams];
    newParams[index].value = event.target.value;
    setConstructorParams(newParams);
  };

  const constructParamsObject = (params: ConstructorParam[]): { [key: string]: any } => {
    const paramsObj: { [key: string]: any } = {};
    params.forEach((param) => {
      paramsObj[param.name] = param.value;
    });
    return paramsObj;
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    const paramsObject = constructParamsObject(constructorParams);

    chrome.runtime.sendMessage(
      {
        type: 'RIVET_DEPLOY_CONTRACT',
        data: {
          class_hash: selectedClassHash,
          call_data: paramsObject,
        },
      },
      async (response) => {
        if (response?.error) {
          setDeployedContractAddress('');
          setErrorDeployment(response.error);
          setIsDeploying(false);
        } else {
          setErrorDeployment('');
          setDeployedContractAddress(response.contract_address);
          await saveDeployedContract({
            name: paramsObject.name,
            address: response.contract_address,
            classHash: selectedClassHash,
          });
          setIsDeploying(false);
        }
      }
    );
  };

  function findConstructor(abi: Abi): AbiEntry | null {
    return abi.find((entry) => entry.type === 'constructor') ?? null;
  }

  function parseConstructorParams(constructor: AbiEntry): ConstructorParam[] {
    if (!constructor || !constructor.inputs) {
      return [];
    }
    return constructor.inputs.map((input) => ({ name: input.name, type: input.type, value: '' }));
  }

  async function fetchAbiAndParseConstructor() {
    try {
      if (!provider) return;
      const { abi: testAbi } = await provider.getClassByHash(selectedClassHash);
      const constructorEntry = findConstructor(testAbi);
      if (constructorEntry) {
        const params = parseConstructorParams(constructorEntry);
        setConstructorParams(params);
      } else {
        logError('Constructor not found in the ABI');
      }
    } catch (error) {
      logError('Error fetching ABI or parsing constructor:', error);
    }
  }

  useEffect(() => {
    if (selectedClassHash) {
      fetchAbiAndParseConstructor();
    }
  }, [selectedClassHash]);

  return (
    <section>
      <PageHeader title="Deploy smart contract" backButtonHandler={handleBack}>
        <Stack
          direction={'column'}
          spacing={2}
          sx={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '300px' }}
        >
          <TextField
            fullWidth
            label="Contract class hash"
            id="fullWidth"
            value={selectedClassHash}
            onChange={handleInputChange}
            disabled={isDeploying}
          />
          {constructorParams.map((param, index) => (
            <TextField
              key={index}
              fullWidth
              label={`${param.name} (${param.type})`}
              id={`param-${index}`}
              value={param.value}
              onChange={(e) => handleParamChange(index, e)}
              disabled={isDeploying}
            />
          ))}
          <Button
            disabled={selectedClassHash === '' || isDeploying}
            variant="outlined"
            color="primary"
            onClick={() => handleDeploy()}
            sx={{ width: '100%' }}
          >
            Deploy
          </Button>
          {errorDeployment && (
            <Typography color="error" variant="body2">
              {errorDeployment}
            </Typography>
          )}

          {!errorDeployment && deployedContractAddress && (
            <AddressTooltip address={deployedContractAddress} />
          )}
          {isDeploying && (
            <Box display="flex" width="100%" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          )}
        </Stack>
      </PageHeader>
    </section>
  );
};
