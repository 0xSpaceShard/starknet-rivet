import { CairoAssembly, CompiledContract } from 'starknet-6';
import { AccountData } from '../components/context/interfaces';

// Type
export type ResponseMessage = {
  success: boolean;
  urlList?: DevnetInfo[];
  blockInterval?: BlockInterval;
};

type BlockInterval = {
  [key: string]: number;
};

// Message Interface
interface Message<D> {
  data: D;
}

export interface DevnetInfo {
  url: string;
  isAlive: boolean;
}

export interface DeclareContractMessage
  extends Message<{
    sierra: string | CompiledContract;
    casm: CairoAssembly | undefined;
  }> {}

export interface DeployContractMessage
  extends Message<{
    class_hash: string;
    call_data: {
      [key: string]: any;
    };
  }> {}

export interface UpdateAccountContractsMessage
  extends Message<{
    accountContracts: {
      [k: string]: string[];
    };
  }> {}

export interface UrlMessage
  extends Message<{
    url: string;
  }> {}

export interface BlockIntervalMessage
  extends Message<{
    url: string;
    interval: number;
  }> {}

export interface UrlListMessage extends Message<DevnetInfo> {}

export interface NewUrlToListtMessage
  extends Message<{
    item: DevnetInfo;
  }> {}

export interface SelectedAccountMessage
  extends Message<{
    selectedAccount: AccountData | null;
  }> {}

export interface DevnetConfig {
  seed: number;
  total_accounts: number;
  account_contract_class_hash: string;
  predeployed_accounts_initial_balance: string;
  start_time: null;
  gas_price_wei: number;
  gas_price_fri: number;
  data_gas_price_wei: number;
  data_gas_price_fri: number;
  chain_id: string;
  dump_on: string;
  dump_path: string;
  state_archive: string;
  fork_config: ForkConfig;
  server_config: ServerConfig;
  block_generation: null;
  lite_mode: boolean;
  eth_erc20_class_hash: string;
  strk_erc20_class_hash: string;
}

export interface ForkConfig {
  url: string;
  block_number: number;
}

export interface ServerConfig {
  host: string;
  port: number;
  timeout: number;
  request_body_size_limit: number;
  restricted_methods: null;
}
