
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

interface PoolStatus {
  status: "idle" | "approving" | "creating" | "success" | "error";
  message: string;
  poolAddress?: string;
  lpTokensReceived?: string;
  txHash?: string;
}

interface StatusAreaProps {
  status: PoolStatus;
}

// Etherscan URLs for different networks
const ETHERSCAN_URLS = {
  // Mainnets
  1: "https://etherscan.io", // Ethereum Mainnet
  56: "https://bscscan.com", // Binance Smart Chain
  137: "https://polygonscan.com", // Polygon
  42161: "https://arbiscan.io", // Arbitrum
  10: "https://optimistic.etherscan.io", // Optimism
  
  // Testnets
  5: "https://goerli.etherscan.io", // Goerli Testnet
  11155111: "https://sepolia.etherscan.io", // Sepolia Testnet
  80001: "https://mumbai.polygonscan.com", // Mumbai Testnet
  421613: "https://goerli.arbiscan.io", // Arbitrum Goerli
  420: "https://goerli-optimism.etherscan.io", // Optimism Goerli
};

const StatusArea = ({ status }: StatusAreaProps) => {
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [etherscanUrl, setEtherscanUrl] = useState("https://etherscan.io");

  useEffect(() => {
    const getChainId = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();
          setCurrentChainId(network.chainId);
          
          // Set the appropriate Etherscan URL based on network
          if (ETHERSCAN_URLS[network.chainId]) {
            setEtherscanUrl(ETHERSCAN_URLS[network.chainId]);
          } else {
            // Default to Ethereum mainnet for unknown networks
            setEtherscanUrl("https://etherscan.io");
          }
        } catch (error) {
          console.error("Error getting chain ID:", error);
        }
      }
    };
    
    getChainId();
    
    // Listen for chain changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        getChainId();
      });
      
      // Cleanup
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('chainChanged', getChainId);
        }
      };
    }
  }, []);

  if (status.status === "idle") {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center text-sm text-gray-500">
          <Info className="h-4 w-4 mr-2 text-[#33C3F0]" />
          {status.message}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "border-0 shadow-md overflow-hidden",
      status.status === "success" ? "bg-gradient-to-r from-[#D6BCFA]/20 to-[#D3E4FD]/20" : "bg-white"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center">
            {status.status === "creating" && (
              <div className="h-6 w-6 mr-3 flex-shrink-0">
                <Loader className="h-6 w-6 animate-spin text-[#33C3F0]" />
              </div>
            )}
            {status.status === "success" && (
              <div className="h-6 w-6 mr-3 rounded-full bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
            <p className={cn(
              "font-medium",
              status.status === "success" ? "text-[#7E69AB]" : "text-gray-800"
            )}>
              {status.message}
            </p>
          </div>

          {status.status === "success" && status.poolAddress && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pool Address:</p>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded overflow-x-auto">
                  {status.poolAddress}
                </p>
              </div>
              
              {status.lpTokensReceived && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">LP Tokens Received:</p>
                  <p className="text-lg font-semibold text-[#1A1F2C]">
                    {status.lpTokensReceived}
                  </p>
                </div>
              )}
              
              {status.txHash && (
                <a 
                  href={`${etherscanUrl}/tx/${status.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[#33C3F0] hover:underline text-sm mt-2"
                >
                  View on Block Explorer
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusArea;
