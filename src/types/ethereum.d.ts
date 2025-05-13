
interface Window {
  ethereum: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, callback: (...args: any[]) => void) => void;
    removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
    selectedAddress: string | undefined;
    chainId: string | undefined;
    isConnected: () => boolean;
    enable: () => Promise<string[]>;
    send: (request: any, callback: (error: any, response: any) => void) => void;
  };
}

interface EthereumEvent {
  connect: { chainId: string };
  disconnect: undefined;
  accountsChanged: string[];
  chainChanged: string;
  message: { type: string; data: unknown };
}
