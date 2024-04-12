import React, { useState, ChangeEvent, useContext } from 'react';
import './dockerCommand.css'
import InfoIcon from '../infoIcon/infoIcon';
import {ACCOUNT_INFO, ACCOUNT_CLASS_INFO, ACCOUNT_CLASS_CUSTOM_INFO, SEED_INFO, START_TIME_INFO, DUMP_ON_INFO, DUMP_PATH_INFO, STATE_ARCHIVE_CAPACITY_INFO, FORK_NETWORK_INFO, FORK_BLOCK_INFO} from "../../info";
import { Context } from '../context/context';

interface Options {
    accounts: number;
    accountClass: string;
    accountClassCustom: string;
    initialBalance: string;
    seed: string;
    host: string;
    port: number;
    startTime: number,
    timeOut: number,
    gasPrice: number,
    dataGasPrice: number,
    chainId: string,
    dumpOn: string,
    dumpPath: string,
    stateArchiveCapacity: string,
    forkNetwork: string,
    forkBlock: number,
}

const DockerCommandGenerator: React.FC = () => {
    const context = useContext(Context);
    if (!context) {
      throw new Error('Context value is undefined');
    }

    const defaultOptions: Options = {
        accounts: 10,
        accountClass: 'cairo1',
        accountClassCustom: '',
        initialBalance: "1000000000000000000000",
        seed: '',
        host: '127.0.0.1',
        port: 5050,
        startTime: 0,
        timeOut: 120,
        gasPrice: 100000000000,
        dataGasPrice: 100000000000,
        chainId: 'TESTNET',
        dumpOn: '',
        dumpPath: '',
        stateArchiveCapacity: 'none',
        forkNetwork: '',
        forkBlock: 0,
    };
    
    const [options, setOptions] = useState<Options>(defaultOptions);
    const [initialBalanceError, setInitialBalanceError] = useState('');
    const [seedError, setSeedError] = useState('');
    const [startTimeError, setStartTimeError] = useState('');
    const [timeOutError, setTimeOutError] = useState('');
    const [generalError, setGeneralError] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [generateCommand, setGenerateCommand] = useState(false);
    const [toContinue, setToContinue] = useState(false)
    const { url, setUrl } = context;

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
            // Convert the decimal value to hexadecimal
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
        if (name === 'timeOut') {
            if (!Number.isNaN(Number(value))) {
            const startTimeValue = parseInt(value);
            if (startTimeValue < 0 || startTimeValue > 65535 ) {
                setTimeOutError('TimeOut value must be between 0 and 65535 ');
                setGeneralError(true);
                return;
            } else {
                setTimeOutError('');
            }
            } else {
            setTimeOutError('Invalid TimeOut value');
            setGeneralError(true);
            return;
            }
        }
        setGeneralError(false);
        
    };

const generateDockerCommand = (options: Options) => {
    let command = 'docker run -p ';

    setUrl(`${options.host}:${options.port}`);
    command += `${options.host}:${options.port}:${options.port} shardlabs/starknet-devnet-rs`;

    Object.keys(options).forEach(option => {
        if (options[option as keyof Options] !== defaultOptions[option as keyof Options]) {
            if (typeof options[option as keyof Options] === 'boolean' && options[option as keyof Options]) {
                command += ` --${option}`;
            } else {
                command += ` --${option} ${options[option as keyof Options]}`;
            }
        }
    });
    setGenerateCommand(true);
    return command;
};

const handleContinue = () => {
    setToContinue(true);
  };

  return (
    <>
    {!toContinue && (
        <div>
        <h2>Docker Command Generator</h2>
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
            <label htmlFor="timeout">TimeOut:</label>
                <InfoIcon content={START_TIME_INFO} />
                <input
                    type="text"
                    name="timeOut"
                    value={options.timeOut}
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

            {!generateCommand && (
                <button 
                    type="button" 
                    onClick={() => alert(generateDockerCommand(options))}
                    disabled={generalError}
                >
                    Generate Docker Command
                </button> 
            )}
            {generateCommand && (
                <button type="button" onClick={handleContinue}>
                    Continue
                </button>
            )}
        </form>
        </div>
    )}
    </>
  );
};

export default DockerCommandGenerator;
