import { CairoAssembly, CompiledContract } from 'starknet-6';
import { AccountData } from '../components/context/interfaces';

// Interface générique pour les messages
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
