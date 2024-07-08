import React, { useState, ChangeEvent, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, InfoOutlined } from '@mui/icons-material';
import {
  ACCOUNT_INFO,
  ACCOUNT_CLASS_INFO,
  ACCOUNT_CLASS_CUSTOM_INFO,
  SEED_INFO,
  START_TIME_INFO,
  DUMP_ON_INFO,
  DUMP_PATH_INFO,
  STATE_ARCHIVE_CAPACITY_INFO,
  FORK_NETWORK_INFO,
  FORK_BLOCK_INFO,
  REQUEST_BODY_SIZE_LIMIT,
} from '../../info';
import { useSharedState } from '../context/context';
import {
  sendMessageToSetBlockInterval,
  sendMessageToSetUrlList,
} from '../utils/sendMessageBackground';
import { Options } from '../context/interfaces';

const DockerCommandGenerator: React.FC = () => {
  const context = useSharedState();

  const defaultOptions: Options = {
    accounts: 10,
    accountClass: 'cairo1',
    accountClassCustom: '',
    initialBalance: '1000000000000000000000',
    seed: '',
    host: '127.0.0.1',
    port: 5050,
    startTime: 0,
    timeout: 120,
    gasPrice: 100000000000,
    dataGasPrice: 100000000000,
    chainId: 'TESTNET',
    dumpOn: '',
    dumpPath: '',
    stateArchiveCapacity: 'none',
    forkNetwork: '',
    forkBlock: 0,
    requestBodySizeLimit: 2000000,
  };

  const [options, setOptions] = useState<Options>(defaultOptions);
  const [initialBalanceError, setInitialBalanceError] = useState('');
  const [seedError, setSeedError] = useState('');
  const [startTimeError, setStartTimeError] = useState('');
  const [timeoutError, setTimeOutError] = useState('');
  const [generalError, setGeneralError] = useState(false);
  const [generateCommand, setGenerateCommand] = useState(false);
  const navigate = useNavigate();

  const { setUrlList, setCommandOptions, blockInterval, setBlockInterval } = context;

  const isValidInitialBalance = (value: string): boolean => {
    const regex = /^(0x)?[0-9a-fA-F]{1,64}$/;
    return regex.test(value);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: value,
    }));
    if (name === 'initialBalance' && !Number.isNaN(Number(value))) {
      if (!isValidInitialBalance(value)) {
        setInitialBalanceError('Invalid initial balance');
        setGeneralError(true);
        return;
      }
      if (Number(value) < 0) {
        setInitialBalanceError('Initial balance cannot be negative');
        setGeneralError(true);
        return;
      }
      setInitialBalanceError('');
    }
    if (name === 'seed') {
      if (!Number.isNaN(Number(value))) {
        const seedValue = parseInt(value, 10);
        if (seedValue < 0 || seedValue > 4294967295) {
          setSeedError('Seed value must be between 0 and 4294967295');
          setGeneralError(true);
          return;
        }
        setSeedError('');
      } else {
        setSeedError('Invalid seed value');
        setGeneralError(true);
        return;
      }
    }
    if (name === 'startTime') {
      if (!Number.isNaN(Number(value))) {
        const startTimeValue = BigInt(value);
        if (startTimeValue < 0 || startTimeValue > 18446744073709551615n) {
          setStartTimeError('StartTime value must be between 0 and 18446744073709551615 ');
          setGeneralError(true);
          return;
        }
        setStartTimeError('');
      } else {
        setStartTimeError('Invalid StartTime value');
        setGeneralError(true);
        return;
      }
    }
    if (name === 'timeout') {
      if (!Number.isNaN(Number(value))) {
        const startTimeValue = parseInt(value, 10);
        if (startTimeValue < 0 || startTimeValue > 65535) {
          setTimeOutError('Timeout value must be between 0 and 65535 ');
          setGeneralError(true);
          return;
        }
        setTimeOutError('');
      } else {
        setTimeOutError('Invalid Timeout value');
        setGeneralError(true);
        return;
      }
    }
    setGeneralError(false);
  };

  function convertCamelToKebab(obj: any): any {
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
      const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      newObj[kebabKey] = obj[key];
    });
    return newObj;
  }

  const generateDockerCommand = useCallback(() => {
    let command = 'docker run -p ';

    const newUrl = `${options.host}:${options.port}`;
    sendMessageToSetUrlList({ url: newUrl, isAlive: true }, setUrlList);

    command += `${options.host}:${options.port}:${options.port} shardlabs/starknet-devnet-rs:6fc953dbe2c76965d713e2d11339440d00d5b616`;

    const kebabCaseOptions = convertCamelToKebab(options);
    const kebabCaseDefaultOptions = convertCamelToKebab(defaultOptions);
    const commandOptionsCopy = { ...kebabCaseOptions };
    setCommandOptions(commandOptionsCopy);

    Object.keys(kebabCaseOptions).forEach((option) => {
      if (
        kebabCaseOptions[option as keyof Options] !==
        kebabCaseDefaultOptions[option as keyof Options]
      ) {
        if (
          typeof kebabCaseOptions[option as keyof Options] === 'boolean' &&
          kebabCaseOptions[option as keyof Options]
        ) {
          command += ` --${option}`;
        } else {
          command += ` --${option} ${kebabCaseOptions[option as keyof Options]}`;
        }
      }
    });
    command += ` --blocks-on-demand`;

    setGenerateCommand(true);
    return command;
  }, [options]);

  const handleBack = () => {
    navigate('/app-settings');
  };

  return (
    <>
      <section>
        <Stack direction={'row'} justifyContent={'center'} position={'relative'}>
          <Box position={'absolute'} top={0} left={0}>
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
          <Container>
            <Typography variant="h6" margin={0} marginY={2}>
              Generator
            </Typography>
          </Container>
        </Stack>
        <Box paddingTop={1} paddingBottom={3}>
          <form id="docker-command-form">
            <Stack textAlign={'left'} paddingLeft={4} spacing={3}>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="accounts"
                    value={options.accounts}
                    label={'Account'}
                    onChange={handleInputChange}
                    error={!options?.accounts || options.accounts > 255}
                    variant={'outlined'}
                    size={'small'}
                    helperText={
                      !options?.accounts
                        ? 'Field is required'
                        : options.accounts > 255
                          ? 'Max predeployed accounts is 255'
                          : ''
                    }
                  ></TextField>
                </Box>
                <Tooltip title={ACCOUNT_INFO} sx={{ marginX: 2 }}>
                  <IconButton>
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Box marginTop={'10px !important'}>
                <FormHelperText style={{ marginBottom: '2px' }}>Account Class</FormHelperText>
                <Stack direction={'row'}>
                  <Box flex={1}>
                    <Select
                      fullWidth
                      name="accountClass"
                      value={options.accountClass}
                      label={'Account Class'}
                      onChange={handleInputChange}
                      size={'small'}
                    >
                      <MenuItem value={'cairo0'}>cairo0</MenuItem>
                      <MenuItem value={'cairo1'}>cairo1</MenuItem>
                    </Select>
                  </Box>
                  <Tooltip title={ACCOUNT_CLASS_INFO} sx={{ marginX: 2 }}>
                    <IconButton>
                      <InfoOutlined />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="accountClassCustom"
                    value={options.accountClassCustom}
                    label={'Custom Account Class'}
                    onChange={handleInputChange}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Tooltip title={ACCOUNT_CLASS_CUSTOM_INFO} sx={{ marginX: 2 }}>
                  <IconButton>
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="initialBalance"
                    value={options.initialBalance}
                    label={'Initial Balance'}
                    onChange={handleInputChange}
                    error={!!initialBalanceError}
                    variant={'outlined'}
                    size={'small'}
                    helperText={initialBalanceError}
                  ></TextField>
                </Box>
                <Box width={'40px'} marginX={2} marginY={0} />
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="seed"
                    value={options.seed}
                    label={'Seed'}
                    onChange={handleInputChange}
                    error={!!seedError}
                    helperText={seedError}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Tooltip title={SEED_INFO} sx={{ marginX: 2 }}>
                  <IconButton>
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="host"
                    value={options.host}
                    label={'Host'}
                    onChange={handleInputChange}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Box width={'40px'} marginX={2} marginY={0} />
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="port"
                    value={options.port}
                    label={'Port'}
                    onChange={handleInputChange}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Box width={'40px'} marginX={2} marginY={0} />
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="startTime"
                    value={options.startTime}
                    label={'Start Time'}
                    onChange={handleInputChange}
                    error={!!startTimeError}
                    helperText={startTimeError}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Tooltip title={START_TIME_INFO} sx={{ marginX: 2 }}>
                  <IconButton>
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="timeout"
                    value={options.timeout}
                    label={'Timeout'}
                    onChange={handleInputChange}
                    error={!!timeoutError}
                    helperText={timeoutError}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Box width={'40px'} marginX={2} marginY={0} />
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="gasPrice"
                    value={options.gasPrice}
                    label={'Gas price'}
                    onChange={handleInputChange}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Box width={'40px'} marginX={2} marginY={0} />
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="dataGasPrice"
                    value={options.dataGasPrice}
                    label={'Data Gas Price'}
                    onChange={handleInputChange}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Box width={'40px'} marginX={2} marginY={0} />
              </Stack>
              <Box marginTop={'10px !important'}>
                <FormHelperText style={{ marginBottom: '2px' }}>Chain Id</FormHelperText>
                <Stack direction={'row'}>
                  <Box flex={1}>
                    <Select
                      fullWidth
                      name="chainId"
                      value={options.chainId}
                      label={'Chain Id'}
                      onChange={handleInputChange}
                      size={'small'}
                    >
                      <MenuItem value={'TESTNET'}>TESTNET</MenuItem>
                      <MenuItem value={'MAINNET'}>MAINNET</MenuItem>
                    </Select>
                  </Box>
                  <Box width={'40px'} marginX={2} marginY={0} />
                </Stack>
              </Box>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="dumpOn"
                    value={options.dumpOn}
                    label={'Dump On'}
                    onChange={handleInputChange}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Tooltip title={DUMP_ON_INFO} sx={{ marginX: 2 }}>
                  <IconButton>
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="dumpPath"
                    value={options.dumpPath}
                    label={'Dump Path'}
                    onChange={handleInputChange}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Tooltip title={DUMP_PATH_INFO} sx={{ marginX: 2 }}>
                  <IconButton>
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Box marginTop={'10px !important'}>
                <FormHelperText style={{ marginBottom: '2px' }}>Archive Capacity</FormHelperText>
                <Stack direction={'row'}>
                  <Box flex={1}>
                    <Select
                      fullWidth
                      name="stateArchiveCapacity"
                      value={options.stateArchiveCapacity}
                      label={'Archive Capacity'}
                      onChange={handleInputChange}
                      size={'small'}
                    >
                      <MenuItem value={'none'}>none</MenuItem>
                      <MenuItem value={'full'}>full</MenuItem>
                    </Select>
                  </Box>
                  <Tooltip title={STATE_ARCHIVE_CAPACITY_INFO} sx={{ marginX: 2 }}>
                    <IconButton>
                      <InfoOutlined />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="forkNetwork"
                    value={options.forkNetwork}
                    label={'Fork Network'}
                    onChange={handleInputChange}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Tooltip title={FORK_NETWORK_INFO} sx={{ marginX: 2 }}>
                  <IconButton>
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="forkBlock"
                    value={options.forkBlock}
                    label={'Fork Block'}
                    onChange={handleInputChange}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Tooltip title={FORK_BLOCK_INFO} sx={{ marginX: 2 }}>
                  <IconButton>
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction={'row'}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    name="requestBodySizeLimit"
                    value={options.requestBodySizeLimit}
                    label={'Request Body Size Limit'}
                    onChange={handleInputChange}
                    variant={'outlined'}
                    size={'small'}
                  ></TextField>
                </Box>
                <Tooltip title={REQUEST_BODY_SIZE_LIMIT} sx={{ marginX: 2 }}>
                  <IconButton>
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Box marginTop={3}>
              <Container>
                {!generateCommand && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => alert(generateDockerCommand())}
                    disabled={generalError}
                  >
                    Generate Docker Command
                  </Button>
                )}
                {generateCommand && (
                  <Box>
                    <Button variant="outlined" color="primary" onClick={handleBack}>
                      Continue
                    </Button>
                  </Box>
                )}
              </Container>
            </Box>
          </form>
        </Box>
      </section>
    </>
  );
};

export default DockerCommandGenerator;
