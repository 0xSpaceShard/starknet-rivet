import { Box, Button, CircularProgress, Stack, styled, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { CompiledSierraCasm, isSierra } from 'starknet-6';
import { useSharedState } from '../context/context';
import PageHeader from './pageHeader';
import AddressTooltip from '../addressTooltip/addressTooltip';

export const DeclareSmartContract: React.FC = () => {
  const [selectedSierraFile, setSelectedSierraFile] = useState<object | null>(null);
  const [selectedCasmFile, setSelectedCasmFile] = useState<CompiledSierraCasm | null>(null);
  const [errorDeclaration, setErrorDeclaration] = useState('');
  const [isDeclaring, setIsDeclaring] = useState(false);

  const [selectedSierraFileName, setSelectedSierraFileName] = useState(
    'Click to upload sierra JSON'
  );
  const [selectedCasmFileName, setSelectedCasmFileName] = useState('Click to upload casm JSON');
  const [checkSierra, setCheckSierra] = useState(true);

  const navigate = useNavigate();
  const context = useSharedState();

  const { selectedAccount, declaredClassHash, setDeclaredClassHash } = context;

  const handleSierraFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json') {
        setSelectedSierraFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result;
          if (typeof content === 'string') {
            try {
              const json = JSON.parse(content);
              const isValidSierra = isSierra(json);
              setCheckSierra(isValidSierra);
              setSelectedSierraFile(json);
            } catch (error) {
              console.debug('Error parsing JSON file:', error);
            }
          }
        };
        reader.readAsText(file);
      } else {
        console.debug('Invalid file type. Please upload a JSON file.');
      }
    }
  };

  const handleCasmFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json') {
        setSelectedCasmFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result;
          if (typeof content === 'string') {
            try {
              const json = JSON.parse(content);
              setSelectedCasmFile(json);
            } catch (error) {
              console.debug('Error parsing JSON file:', error);
            }
          }
        };
        reader.readAsText(file);
      } else {
        console.debug('Invalid file type. Please upload a JSON file.');
      }
    }
  };
  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}`);
  };

  const handleDeclare = () => {
    setIsDeclaring(true);
    chrome.runtime.sendMessage(
      {
        type: 'RIVET_DECLARE_CONTRACT',
        data: {
          sierra: selectedSierraFile,
          casm: selectedCasmFile,
        },
      },
      (response) => {
        if (response?.error) {
          setDeclaredClassHash('');
          setErrorDeclaration(response.error);
          setIsDeclaring(false);
        } else {
          setErrorDeclaration('');
          setDeclaredClassHash(response.class_hash);
          setIsDeclaring(false);
          navigator.clipboard.writeText(response.class_hash);
          navigate(`/accounts/${selectedAccount?.address}/deploy`);
        }
      }
    );
  };

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  return (
    <section>
      <PageHeader title="Declare smart contract" backButtonHandler={handleBack}>
        <Stack
          direction={'column'}
          spacing={2}
          sx={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '300px' }}
        >
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            {selectedSierraFileName}
            <VisuallyHiddenInput
              type="file"
              onChange={handleSierraFileUpload}
              accept=".json"
              disabled={isDeclaring}
            />
          </Button>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            {selectedCasmFileName}
            <VisuallyHiddenInput
              type="file"
              onChange={handleCasmFileUpload}
              accept=".json"
              disabled={isDeclaring}
            />
          </Button>
          {!checkSierra && (
            <Typography color="error" variant="body2">
              Invalid Sierra JSON file. Please upload a valid Sierra JSON file.
            </Typography>
          )}
          <Button
            disabled={!checkSierra || !selectedSierraFile || !selectedCasmFile || isDeclaring}
            variant="outlined"
            color="primary"
            onClick={handleDeclare}
            sx={{ width: '100%' }}
          >
            Declare
          </Button>

          {errorDeclaration && (
            <Typography color="error" variant="body2">
              {errorDeclaration}
            </Typography>
          )}

          {!errorDeclaration && declaredClassHash && <AddressTooltip address={declaredClassHash} />}
          {isDeclaring && (
            <Box display="flex" width="100%" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          )}
        </Stack>
      </PageHeader>
    </section>
  );
};
