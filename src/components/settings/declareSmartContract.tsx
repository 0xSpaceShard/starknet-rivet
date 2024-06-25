import { Box, Button, Link, Stack, styled, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/context';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PageHeader from './pageHeader';
import { CompiledSierraCasm, hash, isSierra } from 'starknet-6';

export const DeclareSmartContract: React.FC = () => {
  const [selectedSierraFile, setSelectedSierraFile] = useState<object | null>(null);
  const [selectedCasmFile, setSelectedCasmFile] = useState<CompiledSierraCasm | null>(null);
  const [declareClassHash, setDeclareClassHash] = useState('');
  const [errorDeclaration, setErrorDeclaration] = useState('');
  const [isCopyTooltipShown, setIsCopyTooltipShown] = useState(false);

  const [selectedSierraFileName, setSelectedSierraFileName] = useState(
    'Click to upload sierra JSON'
  );
  const [selectedCasmFileName, setSelectedCasmFileName] = useState('Click to upload casm JSON');
  const [checkSierra, setCheckSierra] = useState(true);

  const navigate = useNavigate();
  const context = useSharedState();

  const { selectedAccount } = context;

  const handleSierraFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
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
              console.error('Error parsing JSON file:', error);
            }
          }
        };
        reader.readAsText(file);
      } else {
        console.error('Invalid file type. Please upload a JSON file.');
      }
    }
  };

  const handleCasmFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
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
              console.error('Error parsing JSON file:', error);
            }
          }
        };
        reader.readAsText(file);
      } else {
        console.error('Invalid file type. Please upload a JSON file.');
      }
    }
  };
  const handleBack = () => {
    navigate(`/accounts/${selectedAccount?.address}/settings`);
  };

  const handleDeclare = () => {
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
          setDeclareClassHash('');
          setErrorDeclaration(response.error);
        } else {
          setErrorDeclaration('');
          setDeclareClassHash(response.class_hash);
        }
      }
    );
  };

  const handleCopyAddress = () => {
    if (declareClassHash) {
      navigator.clipboard.writeText(declareClassHash);
    }
  };

  const showTooltip = async () => {
    setIsCopyTooltipShown(true);
    setTimeout(() => setIsCopyTooltipShown(false), 3000);
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

  const shortAddress = declareClassHash
    ? `${declareClassHash.slice(0, 12)}...${declareClassHash.slice(-12)}`
    : '';

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
            <VisuallyHiddenInput type="file" onChange={handleSierraFileUpload} accept=".json" />
          </Button>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            {selectedCasmFileName}
            <VisuallyHiddenInput type="file" onChange={handleCasmFileUpload} accept=".json" />
          </Button>
          {!checkSierra && (
            <Typography color="error" variant="body2">
              Invalid Sierra JSON file. Please upload a valid Sierra JSON file.
            </Typography>
          )}
          <Button
            disabled={!checkSierra || !selectedSierraFile || !selectedCasmFile}
            variant="outlined"
            color="primary"
            onClick={() => handleDeclare()}
            sx={{ width: '100%' }}
          >
            Declare
          </Button>

          {errorDeclaration && (
            <Typography color="error" variant="body2">
              {errorDeclaration}
            </Typography>
          )}

          {!errorDeclaration && declareClassHash && (
            <Box paddingY={1}>
              <Tooltip
                PopperProps={{
                  disablePortal: true,
                }}
                open={isCopyTooltipShown}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title="Address copied to clipboard"
              >
                <Link
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyAddress();
                    showTooltip();
                  }}
                >
                  {shortAddress}
                </Link>
              </Tooltip>
            </Box>
          )}
        </Stack>
      </PageHeader>
    </section>
  );
};
