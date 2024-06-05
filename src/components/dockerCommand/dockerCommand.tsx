import React, { useState, ChangeEvent } from 'react';
import './dockerCommand.css'
import InfoIcon from '../infoIcon/infoIcon';
import {ACCOUNT_INFO, ACCOUNT_CLASS_INFO, ACCOUNT_CLASS_CUSTOM_INFO, SEED_INFO, START_TIME_INFO, DUMP_ON_INFO, DUMP_PATH_INFO, STATE_ARCHIVE_CAPACITY_INFO, FORK_NETWORK_INFO, FORK_BLOCK_INFO, REQUEST_BODY_SIZE_LIMIT} from "../../info";
import { Options, useSharedState } from '../context/context';
import { Button } from '@mui/material';

const DockerCommandGenerator: React.FC = () => {
    const context = useSharedState()

    const defaultOptions: Options = {
        accounts: 10,
        accountClass: 'cairo1',
        accountClassCustom: '',
        initialBalance: "1000000000000000000000",
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
        requestBodySizeLimit: 2000000
    };
    
    const [options, setOptions] = useState<Options>(defaultOptions);
    const [initialBalanceError, setInitialBalanceError] = useState('');
    const [seedError, setSeedError] = useState('');
    const [startTimeError, setStartTimeError] = useState('');
    const [timeOutError, setTimeOutError] = useState('');
    const [generalError, setGeneralError] = useState(false);
    const [generateCommand, setGenerateCommand] = useState(false);
    const [toContinue, setToContinue] = useState(false)
    const [msg, setMsg] = useState("");
    const { url, setUrl, devnetIsAlive, setDevnetIsAlive, commandOptions, setCommandOptions, setSelectedComponent} = context;

    const isValidInitialBalance = (value: string): boolean => {
        const regex = /^(0x)?[0-9a-fA-F]{1,64}$/;
        return regex.test(value);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            const hexValue = Number(value).toString(16);
            const newValue = `0x${hexValue}`;
            if (Number(value) < 0) {
                setInitialBalanceError('Initial balance cannot be negative');
                setGeneralError(true);
                return;
            } 
            else {
                setInitialBalanceError('');
            }
        }
        if (name === 'seed') {
            if (!Number.isNaN(Number(value))) {
            const seedValue = parseInt(value);
            if (seedValue < 0 || seedValue > 4294967295) {
                setSeedError('Seed value must be between 0 and 4294967295');
                setGeneralError(true);
                return;
            } else {
                setSeedError('');
            }
            } else {
            setSeedError('Invalid seed value');
            setGeneralError(true);
            return;
            }
        }
        if (name === 'startTime') {
            if (!Number.isNaN(Number(value))) {
            const startTimeValue = BigInt(value);
            if (startTimeValue < 0 || startTimeValue > 18446744073709551615n ) {
                setStartTimeError('StartTime value must be between 0 and 18446744073709551615 ');
                setGeneralError(true);
                return;
            } else {
                setStartTimeError('');
            }
            } else {
            setStartTimeError('Invalid StartTime value');
            setGeneralError(true);
            return;
            }
        }
        if (name === 'timeout') {
            if (!Number.isNaN(Number(value))) {
            const startTimeValue = parseInt(value);
            if (startTimeValue < 0 || startTimeValue > 65535 ) {
                setTimeOutError('Timeout value must be between 0 and 65535 ');
                setGeneralError(true);
                return;
            } else {
                setTimeOutError('');
            }
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
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                newObj[kebabKey] = obj[key];
            }
        }
        return newObj;
    }
    
    const generateDockerCommand = (options: Options) => {
        let command = 'docker run -p ';
    
        setUrl(`${options.host}:${options.port}`);
        command += `${options.host}:${options.port}:${options.port} shardlabs/starknet-devnet-rs`;
    
        const kebabCaseOptions = convertCamelToKebab(options);
        const kebabCaseDefaultOptions = convertCamelToKebab(defaultOptions);
        const commandOptionsCopy = { ...kebabCaseOptions };
        setCommandOptions(commandOptionsCopy);
    
        Object.keys(kebabCaseOptions).forEach(option => {
            if (kebabCaseOptions[option as keyof Options] !== kebabCaseDefaultOptions[option as keyof Options]) {
                if (typeof kebabCaseOptions[option as keyof Options] === 'boolean' && kebabCaseOptions[option as keyof Options]) {
                    command += ` --${option}`;
                } else {
                    command += ` --${option} ${kebabCaseOptions[option as keyof Options]}`;
                }
            }
        });
    
        setGenerateCommand(true);
        return command;
    };

const handleContinue = async () => {
    setToContinue(true);
    setSelectedComponent('');
};

const handleBack = () => {
    setSelectedComponent('')
};

  return (
    <>
    {!toContinue && (
        <div className="popup-container">
            <div className="back-button">
            <Button variant="outlined" onClick={handleBack}>Back</Button>
            </div>
            <div className="popup-content">
                <h2 className='docker-heading'> Docker Command Generator</h2>
                <form className="docker-form">
                    <div className="form-group">
                    <label htmlFor="account">Account:</label>
                        <InfoIcon content={ACCOUNT_INFO} />
                        <input
                            type="text"
                            name="accounts"
                            value={options.accounts || ''}
                            onChange={handleInputChange}
                            className={options.accounts  && options.accounts > 255 ? 'error-message' : 'Max predeployed accounts is 255'}
                        />
                        {options.accounts  && options.accounts > 255 && <p className="error-message">Max predeployed accounts is 255.</p>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="accountClass">Account Class:</label>
                    <InfoIcon content={ACCOUNT_CLASS_INFO} />
                    <select
                        name="accountClass"
                        id="accountClass"
                        value={options.accountClass}
                        onChange={handleInputChange}
                    >
                        <option value="">Select the account class</option>
                        <option value="cairo1">cairo1</option>
                        <option value="cairo0">cairo0</option>
                    </select>
                    </div>
                    <div className="form-group">
                    <label htmlFor="accountClassCustom">Account Class Custom:</label>
                    <InfoIcon content={ACCOUNT_CLASS_CUSTOM_INFO} />
                    <input
                            type="text"
                            name="accountClassCustom"
                            value={options.accountClassCustom}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                    <label htmlFor="initialBalance">initial Balance:</label>
                        <input
                            type="text"
                            name="initialBalance"
                            value={options.initialBalance}
                            onChange={handleInputChange}
                        />
                        {initialBalanceError && <div className="error-message">{initialBalanceError}</div>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="seed">Seed:</label>
                        <InfoIcon content={SEED_INFO} />
                        <input
                            type="text"
                            name="seed"
                            value={options.seed}
                            onChange={handleInputChange}
                        />
                        {seedError && <div className="error-message">{seedError}</div>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="host">Host:</label>
                        <input
                            type="text"
                            name="host"
                            value={options.host}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                    <label htmlFor="port">Port:</label>
                    <input
                        type="text"
                        name="port"
                        id="port"
                        value={options.port}
                        onChange={handleInputChange}
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="start-time">Start time:</label>
                        <InfoIcon content={START_TIME_INFO} />
                        <input
                            type="text"
                            name="startTime"
                            value={options.startTime}
                            onChange={handleInputChange}
                        />
                        {startTimeError && <div className="error-message">{startTimeError}</div>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="timeout">Timeout:</label>
                        <InfoIcon content={START_TIME_INFO} />
                        <input
                            type="text"
                            name="timeout"
                            value={options.timeout}
                            onChange={handleInputChange}
                        />
                        {timeOutError && <div className="error-message">{timeOutError}</div>}

                    </div>

                    <div className="form-group">
                    <label htmlFor="gas-price">Gas Price:</label>
                        <input
                            type="text"
                            name="gasPrice"
                            value={options.gasPrice}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                    <label htmlFor="data-gas-price">Data Gas Price:</label>
                        <input
                            type="text"
                            name="dataGasPrice"
                            value={options.dataGasPrice}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                    <label htmlFor="chain-id">Chain ID:</label>
                        <select
                            name="chainId"
                            id="chainId"
                            value={options.chainId}
                            onChange={handleInputChange}
                        >
                            <option value="">Select the chainId</option>
                            <option value="TESTNET">TESTNET</option>
                            <option value="MAINNET">MAINNET</option>
                        </select>
                    </div>

                    <div className="form-group">
                    <label htmlFor="dump-on">Dump On:</label>
                        <InfoIcon content={DUMP_ON_INFO} />
                        <input
                            type="text"
                            name="dumpOn"
                            value={options.dumpOn}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                    <label htmlFor="dump-path">Dump Path:</label>
                        <InfoIcon content={DUMP_PATH_INFO} />
                        <input
                            type="text"
                            name="dumpPath"
                            value={options.dumpPath}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                    <label htmlFor="state-archive-capacity">State archive capacity:</label>
                    <InfoIcon content={STATE_ARCHIVE_CAPACITY_INFO} />
                    <select
                            name="stateArchiveCapacity"
                            id="stateArchiveCapacity"
                            value={options.stateArchiveCapacity}
                            onChange={handleInputChange}
                        >
                            <option value="">Select the state archive capacity</option>
                            <option value="none">none</option>
                            <option value="full">full</option>
                        </select>
                    </div>

                    <div className="form-group">
                    <label htmlFor="fork-network">Fork network:</label>
                            <InfoIcon content={FORK_NETWORK_INFO} />
                        <input
                            type="text"
                            name="forkNetwork"
                            value={options.forkNetwork}
                            onChange={handleInputChange}
                        />
                    </div>


                    <div className="form-group">
                    <label htmlFor="fork-block">Fork block:</label>
                        <InfoIcon content={FORK_BLOCK_INFO} />
                        <input
                            type="text"
                            name="forkBlock"
                            value={options.forkBlock}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                    <label htmlFor="fork-block">Request Body Size Limit:</label>
                        <InfoIcon content={REQUEST_BODY_SIZE_LIMIT} />
                        <input
                            type="text"
                            name="requestBodySizeLimit"
                            value={options.requestBodySizeLimit}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="button-group">
                        {!generateCommand && (
                            <Button variant="contained" color="primary" onClick={() => alert(generateDockerCommand(options))} disabled={generalError}>
                                Generate Docker Command
                            </Button>
                        )}
                        {generateCommand && (
                            <div style={{ textAlign: 'center' }}>
                                <Button variant="contained" color="primary" onClick={handleContinue}>
                                    Continue
                                </Button>
                                <p className="error-message">{msg}</p>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )}
    </>
  );
};

export default DockerCommandGenerator;
