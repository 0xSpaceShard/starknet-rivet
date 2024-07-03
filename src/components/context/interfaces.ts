import { Component } from './enum';

export interface AccountData {
  address: string;
  initial_balance: string;
  balance?: string;
  private_key: string;
  public_key: string;
}

export interface ListOfDevnet {
  url: string;
  isAlive: boolean;
}

export interface Options {
  accounts: number;
  accountClass: string;
  accountClassCustom: string;
  initialBalance: string;
  seed: string;
  host: string;
  port: number;
  startTime: number;
  timeout: number;
  gasPrice: number;
  dataGasPrice: number;
  chainId: string;
  dumpOn: string;
  dumpPath: string;
  stateArchiveCapacity: string;
  forkNetwork: string;
  forkBlock: number;
  requestBodySizeLimit: number;
}

export interface TransactionInfo {
  data: any;
  gas_fee?: string;
  error?: any;
}

export interface MyContextValue {
  accounts: AccountData[];
  setAccounts: React.Dispatch<React.SetStateAction<AccountData[]>>;
  url: string;
  setUrl: React.Dispatch<React.SetStateAction<string>>;
  devnetIsAlive: boolean;
  setDevnetIsAlive: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAccount: AccountData | null;
  setSelectedAccount: React.Dispatch<React.SetStateAction<AccountData | null>>;
  currentBalance: bigint;
  setCurrentBalance: React.Dispatch<React.SetStateAction<bigint>>;
  commandOptions: Options | null;
  setCurrentBlock: React.Dispatch<React.SetStateAction<number>>;
  currentBlock: number;
  blockInterval: Map<string, number>;
  setBlockInterval: React.Dispatch<React.SetStateAction<Map<string, number>>>;
  setCommandOptions: React.Dispatch<React.SetStateAction<Options | null>>;
  configData: any | null;
  setConfigData: React.Dispatch<React.SetStateAction<any | null>>;
  urlList: ListOfDevnet[];
  setUrlList: React.Dispatch<React.SetStateAction<ListOfDevnet[]>>;
  selectedComponent: Component | null;
  setSelectedComponent: React.Dispatch<React.SetStateAction<Component | null>>;
  transactionData: TransactionInfo | null;
  setTransactionData: React.Dispatch<React.SetStateAction<TransactionInfo | null>>;
  signatureData: any;
  setSignatureData: React.Dispatch<React.SetStateAction<any>>;
}
