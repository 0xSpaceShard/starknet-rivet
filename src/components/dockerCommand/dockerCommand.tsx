import React, { useState, ChangeEvent } from 'react';
import './dockerCommand.css'
import InfoIcon from '../infoIcon/infoIcon';

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
  // Add other options with default values here
}


const DockerCommandGenerator: React.FC = () => {
  const [options, setOptions] = useState<Options>({
    accounts: 10,
    accountClass: 'cairo1',  // [possible values: cairo1, cairo0]
    accountClassCustom: '',
    initialBalance: "1000000000000000000000",
    seed: '',
    host: '127.0.0.1',
    port: 5050,
    startTime: 0,
    timeOut: 120,
    gasPrice: 100000000000,
    dataGasPrice: 100000000000,
    chainId: 'TESTNET', // [possible values: MAINNET, TESTNET]
    dumpOn: '', // [possible values: exit, transaction]
    dumpPath: '',
    stateArchiveCapacity: 'none', // [possible values: none, full]
    forkNetwork: '',
    forkBlock: 0,
  });

  const [initialBalanceError, setInitialBalanceError] = useState('');
  const [seedError, setSeedError] = useState('');
  const [startTimeError, setStartTimeError] = useState('');
  const [timeOutError, setTimeOutError] = useState('');
  const [generalError, setGeneralError] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOptions((prevOptions) => ({
        ...prevOptions,
        [name]: value,
      }));
    if (name === 'initialBalance' && !Number.isNaN(Number(value))) {
        // Convert the decimal value to hexadecimal
        const hexValue = Number(value).toString(16);
        const newValue = `0x${hexValue}`;
        if (Number(value) < 0) {
            setInitialBalanceError('Initial balance cannot be negative');
            setGeneralError(true);
            return;
        } 
        else if (!/^0x[0-9a-fA-F]{64}$/.test(newValue)) {
            setInitialBalanceError('Invalid initial balance');
            setGeneralError(true);
            return;
        }
        else {
            setInitialBalanceError('');
        }
    }
    if (name === 'seed') {
        // Validate if the value is a number and within the specified range
        if (!Number.isNaN(Number(value))) {
          const seedValue = parseInt(value);
          if (seedValue < 0 || seedValue > 4294967295) {
            // If the value is outside the valid range, set an error message
            setSeedError('Seed value must be between 0 and 4294967295');
            setGeneralError(true);
            return;
          } else {
            // If the value is within the valid range, clear the error message
            setSeedError('');
          }
        } else {
          // If the value is not a number, set an error message
          setSeedError('Invalid seed value');
          setGeneralError(true);
          return;
        }
    }
    if (name === 'startTime') {
        // Validate if the value is a number and within the specified range
        if (!Number.isNaN(Number(value))) {
          const startTimeValue = BigInt(value);
          if (startTimeValue < 0 || startTimeValue > 18446744073709551615n ) {
            // If the value is outside the valid range, set an error message
            setStartTimeError('StartTime value must be between 0 and 18446744073709551615 ');
            setGeneralError(true);
            return;
          } else {
            // If the value is within the valid range, clear the error message
            setStartTimeError('');
          }
        } else {
          // If the value is not a number, set an error message
          setStartTimeError('Invalid StartTime value');
          setGeneralError(true);
          return;
        }
    }
    if (name === 'timeOut') {
        // Validate if the value is a number and within the specified range
        if (!Number.isNaN(Number(value))) {
          const startTimeValue = parseInt(value);
          if (startTimeValue < 0 || startTimeValue > 65535 ) {
            // If the value is outside the valid range, set an error message
            setTimeOutError('TimeOut value must be between 0 and 65535 ');
            setGeneralError(true);
            return;
          } else {
            // If the value is within the valid range, clear the error message
            setTimeOutError('');
          }
        } else {
          // If the value is not a number, set an error message
          setTimeOutError('Invalid TimeOut value');
          setGeneralError(true);
          return;
        }
    }
    setGeneralError(false);
    
  };

  const generateDockerCommand = () => {
    // Generate the Docker command based on the options
    let command = 'docker run -p ';
    command += `${options.host}:${options.port}:${options.port} shardlabs/starknet-devnet-rs`;
    if (options.accounts && options.accounts > 0 && options.accounts < 10) {
        command += ` --accounts ${options.accounts}`;
    }
    if (options.accountClass && options.accountClass != 'cairo1') {
        command += ` --account-class ${options.accountClass}`;
    }
    // --initial-balance
    // --seed 
    // --start-time
    // --timeout
    // --gas-price
    // --data-gas-price
    // --chain-id
    // --dump-on
    // --dump-path 
    // --state-archive-capacity
    // --fork-network
    // --fork-block

    // Add other options to the command
    // Example: command += ` --accounts ${options.accounts}`;
    // Example: command += ` --account-class ${options.accountClass}`;
    // Add more options as needed

    return command;
  };

  const handleTooltipToggle = () => {
    setTooltipVisible(!tooltipVisible);
  };

  return (
    <div>
      <h2>Docker Command Generator</h2>
      <form className="docker-form">
        <div className="form-group">
        <label htmlFor="account">Account:</label>
            <InfoIcon content="Devnet predeploys a UDC, an ERC20 (fee token) contract and a set of predeployed funded accounts." />
            <input
                type="text"
                name="accounts"
                value={options.accounts}
                onChange={handleInputChange}
                className={options.accounts > 255 ? 'error-message' : 'Max predeployed accounts is 255'}
            />
             {options.accounts > 255 && <p className="error-message">Max predeployed accounts is 255.</p>}
        </div>

        <div className="form-group">
          <label htmlFor="accountClass">Account Class:</label>
          <InfoIcon content="Choose between predeploying Cairo 0 (OpenZeppelin 0.5.1) or Cairo 1 (default: OpenZeppelin 0.8.1) accounts" />
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
          <InfoIcon content="Provide a path to the Sierra artifact of your custom account" />
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
            <InfoIcon content="By appending the `-seed0` suffix, you can use images which predeploy funded accounts with `--seed 0`, thus always predeploying the same set of accounts:" />
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
            <InfoIcon content="Devnet can be started with the `--start-time` argument, where `START_TIME_IN_SECONDS` should be greater than 0." />
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
            <InfoIcon content="Timeout can be passed to Devnet's HTTP server. This makes it easier to deploy and manage large contracts that take longer to execute." />
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
            <InfoIcon content="Specify when to dump the state of Devnet; [possible values: exit, transaction]" />
            <input
                type="text"
                name="dumpOn"
                value={options.dumpOn}
                onChange={handleInputChange}
            />
        </div>

        <div className="form-group">
        <label htmlFor="dump-path">Dump Path:</label>
            <InfoIcon content="Specify the path to dump to" />
            <input
                type="text"
                name="dumpPath"
                value={options.dumpPath}
                onChange={handleInputChange}
            />
        </div>

        <div className="form-group">
        <label htmlFor="state-archive-capacity">State archive capacity:</label>
        <InfoIcon content="With state archive capacity set to <strong>full</strong>, Devnet will store full state history.
                  The default mode is <strong>none</strong>, where no old states are stored." />
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
                <InfoIcon content="To interact with contracts deployed on mainnet or testnet, you can use the forking to simulate the origin and experiment with it locally, making no changes to the origin itself." />
            <input
                type="text"
                name="forkNetwork"
                value={options.forkNetwork}
                onChange={handleInputChange}
            />
        </div>


        <div className="form-group">
        <label htmlFor="fork-block">Fork block:</label>
            <InfoIcon content="Specify the number of the block to fork at" />
            <input
                type="text"
                name="forkBlock"
                value={options.forkBlock}
                onChange={handleInputChange}
            />
        </div>

        <button 
            type="button" 
            onClick={() => alert(generateDockerCommand())}
            disabled={generalError}
        >
            Generate Docker Command
        </button>
      </form>
    </div>
  );
};

export default DockerCommandGenerator;
