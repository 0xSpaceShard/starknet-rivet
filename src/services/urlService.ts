class UrlContext {
  private static instance: UrlContext;

  private url: string | null = null;

  static getInstance(): UrlContext {
    if (!UrlContext.instance) {
      UrlContext.instance = new UrlContext();
    }
    return UrlContext.instance;
  }

  setSelectedUrl(url: string | null) {
    this.url = url;
  }

  getSelectedUrl(): string | null {
    return this.url;
  }
}

export default UrlContext;
