import { CairoAssembly, CompiledContract } from 'starknet-6';
import { AccountData } from '../components/context/interfaces';

// Type
export type ResponseMessage = {
  success: boolean;
  urlList?: ListOfDevnet[];
  blockInterval?: BlockInterval;
};

type BlockInterval = {
  [key: string]: any;
};

// Message Interface
interface Message<D> {
  data: D;
}

export interface ListOfDevnet {
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

export interface UrlListMessage extends Message<ListOfDevnet> {}

export interface NewUrlToListtMessage
  extends Message<{
    item: ListOfDevnet;
  }> {}

export interface SlectedAccountMessage
  extends Message<{
    selectedAccount: AccountData | null;
  }> {}
