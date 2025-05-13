
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, RefreshCw } from "lucide-react";
import { connectWallet } from "@/utils/liquidityUtils";
import { shortenAddress } from "@/utils/addressUtils";
import { toast } from "@/components/ui/sonner";

interface WalletStatusProps {
  className?: string;
}

const WalletStatus = ({ className }: WalletStatusProps) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  
  // Check if wallet is already connected when component mounts
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum?.selectedAddress) {
        setAddress(window.ethereum.selectedAddress);
        
        // Also get chain ID
        if (window.ethereum.chainId) {
          setChainId(window.ethereum.chainId);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        toast.success("Wallet account changed");
      } else {
        setAddress(null);
        toast.info("Wallet disconnected");
      }
    };
    
    // Listen for chain changes
    const handleChainChanged = (chainIdHex: string) => {
      setChainId(chainIdHex);
      toast.info("Network changed");
      
      // Reload the page to ensure all components get updated chain information
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const account = await connectWallet();
      if (account) {
        setAddress(account);
        toast.success("Wallet connected successfully");
        
        // Get chain ID after connecting
        if (window.ethereum?.chainId) {
          setChainId(window.ethereum.chainId);
        }
      } else {
        toast.error("Failed to connect wallet");
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      toast.error(`Connection error: ${error.message || "Unknown error"}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Get network name from chain ID
  const getNetworkName = (chainIdHex: string | null): string => {
    if (!chainIdHex) return "Unknown";
    
    const chainIdNumber = parseInt(chainIdHex, 16);
    switch (chainIdNumber) {
      case 1: return "Ethereum Mainnet";
      case 3: return "Ropsten Testnet";
      case 4: return "Rinkeby Testnet";
      case 5: return "Goerli Testnet";
      case 42: return "Kovan Testnet";
      case 56: return "BSC Mainnet";
      case 97: return "BSC Testnet";
      case 137: return "Polygon Mainnet";
      case 80001: return "Polygon Mumbai";
      default: return `Chain ID: ${chainIdNumber}`;
    }
  };

  if (address) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center rounded-full bg-green-100 px-3 py-1 group relative">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          <span className="text-sm text-green-800 font-medium">
            {shortenAddress(address)}
          </span>
          
          {/* Network indicator */}
          {chainId && (
            <span className="ml-2 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              {getNetworkName(chainId)}
            </span>
          )}
          
          {/* Tooltip with full address on hover */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {address}
          </div>
        </div>
        
        {/* Add disconnect button */}
        <Button
          onClick={handleConnect}
          variant="ghost"
          size="sm"
          className="p-1 h-auto"
          title="Refresh connection"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isConnecting}
      variant="outline" 
      size="sm"
      className={className}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

export default WalletStatus;
