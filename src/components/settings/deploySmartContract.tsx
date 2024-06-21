import { Button, Stack, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/context';
import PageHeader from './pageHeader';
import { Abi, provider, RpcProvider } from 'starknet-6';

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
  const [selectedClassHash, setSelectedClassHash] = useState('');
  const [constructorParams, setConstructorParams] = useState<ConstructorParam[]>([]);

  const navigate = useNavigate();
  const context = useSharedState();

  const { selectedAccount, url } = context;

  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}/settings`);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedClassHash(event.target.value);
  };

  const handleParamChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newParams = [...constructorParams];
    newParams[index].value = event.target.value;
    setConstructorParams(newParams);
  };

  const handleDeploy = () => {
    const paramsObject = constructParamsObject(constructorParams);

    console.group('DEPLOY: ', selectedClassHash);
    console.group('CALL DATA: ', constructorParams);

    chrome.runtime.sendMessage(
      {
        type: 'RIVET_DEPLOY_CONTRACT',
        data: {
          class_hash: selectedClassHash,
          call_data: paramsObject,
        },
      },
      (response) => {
        console.log('Response from background:', response);
      }
    );
  };

  function findConstructor(abi: Abi): AbiEntry | null {
    console.log("ABI: ", abi)

    for (const entry of abi) {
      if (entry.type === 'constructor') {
        console.log("ENTRY: ", entry)
        return entry;
      }
    }
    return null;
  }

  const constructParamsObject = (params: ConstructorParam[]): { [key: string]: any } => {
    const paramsObj: { [key: string]: any } = {};
    params.forEach(param => {
      console.log("PARAMS VALUE: ", param.value)
      paramsObj[param.name] = param.value;
    });
    console.log("OBJ: ", paramsObj)
    return paramsObj;
  };

  function parseConstructorParams(constructor: AbiEntry): ConstructorParam[] {
    if (!constructor || !constructor.inputs) {
      return [];
    }
    return constructor.inputs.map((input) => ({ name: input.name, type: input.type, value: '' }));
  }

  async function fetchAbiAndParseConstructor(selectedClassHash: string) {
    const provider = new RpcProvider({ nodeUrl: `http://${url}/rpc` });

    try {
      const { abi: testAbi } = await provider.getClassByHash(selectedClassHash);
      const constructorEntry = findConstructor(testAbi);
      if (constructorEntry) {
        const params = parseConstructorParams(constructorEntry);
        setConstructorParams(params);
        console.log('Constructor Parameters:', params);
      } else {
        console.log('Constructor not found in the ABI');
      }
    } catch (error) {
      console.error('Error fetching ABI or parsing constructor:', error);
    }
  }

  useEffect(() => {
    if (selectedClassHash) {
      fetchAbiAndParseConstructor(selectedClassHash);
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
          />
          {constructorParams.map((param, index) => (
            <TextField
              key={index}
              fullWidth
              label={`${param.name} (${param.type})`}
              id={`param-${index}`}
              value={param.value}
              onChange={(e) => handleParamChange(index, e)}
            />
          ))}
          <Button
            disabled={selectedClassHash !== '' ? false : true}
            variant="outlined"
            color="primary"
            onClick={() => handleDeploy()}
            sx={{ width: '100%' }}
          >
            Deploy
          </Button>
        </Stack>
      </PageHeader>
    </section>
  );
};
