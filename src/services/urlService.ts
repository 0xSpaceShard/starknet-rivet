import { Account } from "starknet";

class UrlContext {
    private static instance: UrlContext;
    private url: string | null = null;
  
    private constructor() {}
  
    static getInstance(): UrlContext {
      if (!UrlContext.instance) {
        UrlContext.instance = new UrlContext();
      }
      return UrlContext.instance;
    }
  
    setSelectedUrl(account: string | null) {
      this.url = account;
    }
  
    getSelectedUrl(): string | null {
      return this.url;
    }
  }
  
  export default UrlContext;