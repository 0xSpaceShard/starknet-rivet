import { Account } from "starknet-6";

class SingletonContext {
    private static instance: SingletonContext;
    private selectedAccount: string | null = null;
  
    private constructor() {}
  
    static getInstance(): SingletonContext {
      if (!SingletonContext.instance) {
        SingletonContext.instance = new SingletonContext();
      }
      return SingletonContext.instance;
    }
  
    setSelectedAccount(account: string | null) {
      this.selectedAccount = account;
    }
  
    getSelectedAccount(): string | null {
      return this.selectedAccount;
    }
  }
  
  export default SingletonContext;