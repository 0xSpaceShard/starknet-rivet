export interface AccountData {
  address: string;
  initial_balance: string;
  balance?: any;
  private_key: string;
  public_key: string;
}

export interface UrlItem {
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
  blockGenerationOn: string | number;
}

export interface TransactionInfo {
  data: any;
  gas_fee?: string;
  error?: any;
}

export interface MyContextValue {
  accounts: AccountData[];
  setAccounts: React.Dispatch<React.SetStateAction<AccountData[]>>;

  selectedAccount: AccountData | null;
  updateSelectedAccount: (updatedData: AccountData | null) => Promise<void>;

  selectedUrl: string;
  updateSelectedUrl: (updatedData: string) => Promise<void>;

  urlList: UrlItem[];
  updateUrlList: (updatedData: UrlItem[]) => Promise<void>;

  currentBalance: bigint;
  updateCurrentBalance: (updatedData: bigint) => Promise<void>;

  devnetIsAlive: boolean;
  setDevnetIsAlive: React.Dispatch<React.SetStateAction<boolean>>;

  commandOptions: Options | null;
  setCurrentBlock: React.Dispatch<React.SetStateAction<number>>;
  currentBlock: number;
  blockInterval: Map<string, number>;
  setBlockInterval: React.Dispatch<React.SetStateAction<Map<string, number>>>;
  setCommandOptions: React.Dispatch<React.SetStateAction<Options | null>>;
  configData: any | null;
  setConfigData: React.Dispatch<React.SetStateAction<any | null>>;
  transactionData: TransactionInfo | null;
  setTransactionData: React.Dispatch<React.SetStateAction<TransactionInfo | null>>;
  signatureData: any;
  setSignatureData: React.Dispatch<React.SetStateAction<any>>;
  lastFetchedUrl: string | null;
  setLastFetchedUrl: React.Dispatch<React.SetStateAction<string | null>>;
  blockDetails: any;
  setBlockDetails: React.Dispatch<React.SetStateAction<any>>;
}
