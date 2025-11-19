export {};

declare global {
  interface EcocashBridge {
    openDeepLink: (url: string) => void;
  }

  interface Window {
    EcocashBridge?: EcocashBridge;
    __ECO_TOKEN__?: string;
    __ECO_METADATA__?: Record<string, unknown>;
    ecoAssistAnalytics?: Array<Record<string, unknown>>;
  }
}
