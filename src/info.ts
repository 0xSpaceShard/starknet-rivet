export const ACCOUNT_INFO =
  'Devnet predeploys a UDC, an ERC20 (fee token) contract and a set of predeployed funded accounts.';
export const ACCOUNT_CLASS_INFO =
  'Choose between predeploying Cairo 0 (OpenZeppelin 0.5.1) or Cairo 1 (default: OpenZeppelin 0.8.1) accounts';
export const ACCOUNT_CLASS_CUSTOM_INFO =
  'Provide a path to the Sierra artifact of your custom account';
export const SEED_INFO =
  'By appending the `-seed0` suffix, you can use images which predeploy funded accounts with `--seed 0`, thus always predeploying the same set of accounts';
export const START_TIME_INFO =
  'Devnet can be started with the `--start-time` argument, where `START_TIME_IN_SECONDS` should be greater than 0.';
export const TIMEOUT_INFO =
  "Timeout can be passed to Devnet's HTTP server. This makes it easier to deploy and manage large contracts that take longer to execute.";
export const DUMP_ON_INFO =
  'Specify when to dump the state of Devnet; [possible values: exit, transaction]';
export const DUMP_PATH_INFO = 'Specify the path to dump to';
export const STATE_ARCHIVE_CAPACITY_INFO =
  'With state archive capacity set to FULL, Devnet will store full state history. The default mode is NONE, where no old states are stored.';
export const FORK_NETWORK_INFO =
  'To interact with contracts deployed on mainnet or testnet, you can use the forking to simulate the origin and experiment with it locally, making no changes to the origin itself.';
export const FORK_BLOCK_INFO = 'Specify the number of the block to fork at';
export const REQUEST_BODY_SIZE_LIMIT =
  'Specify the maximum HTTP request body size; [default: 2000000]';
export const BLOCK_GENERATION_ON_INFO =
  'Set to transaction, a new block is generated with each new transaction. Set to demand you will have to mint new block yourself or you can directly set an Interval';
