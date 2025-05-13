
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { ethers } from "ethers";
import TokenInput from "./TokenInput";
import StatusArea from "./StatusArea";
import CreatePoolButton from "./CreatePoolButton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; 
import { InfoIcon, AlertCircle } from "lucide-react";
import { 
  approveToken, 
  createPoolAndAddLiquidity, 
  connectWallet,
  validateDEXContracts
} from "@/utils/liquidityUtils";

interface PoolStatus {
  status: "idle" | "approving" | "creating" | "success" | "error";
  message: string;
  poolAddress?: string;
  lpTokensReceived?: string;
  txHash?: string;
}

// Contract addresses for different networks
const NETWORK_CONTRACTS = {
  // Ethereum Mainnet
  1: {
    router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
    factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", // Uniswap V2 Factory
    name: "Ethereum Mainnet"
  },
  // Goerli Testnet
  5: {
    router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    name: "Goerli Testnet"
  },
  // Sepolia Testnet
  11155111: {
    router: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008", // Updated Sepolia address
    factory: "0x7E0987E5b3a30e3f2828572Bb659A548460a3003", // Updated Sepolia address
    name: "Sepolia Testnet"
  },
  // Binance Smart Chain
  56: {
    router: "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap Router
    factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", // PancakeSwap Factory
    name: "Binance Smart Chain"
  },
  // Polygon
  137: {
    router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", // QuickSwap Router
    factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32", // QuickSwap Factory
    name: "Polygon"
  },
  // Mumbai testnet
  80001: {
    router: "0x8954AfA98594b838bda56FE4C12a09D7739D179b", // QuickSwap Router
    factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32", // QuickSwap Factory
    name: "Polygon Mumbai"
  },
  // Arbitrum One
  42161: {
    router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", // SushiSwap Router
    factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4", // SushiSwap Factory
    name: "Arbitrum One"
  },
  // Optimism
  10: {
    router: "0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8", // Velodrome Router
    factory: "0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746", // Velodrome Factory
    name: "Optimism"
  }
};

// These will be used as fallback for unknown networks
const DEFAULT_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router
const DEFAULT_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; // Uniswap V2 Factory

const LiquidityPoolForm = () => {
  // Token A state
  const [tokenAAddress, setTokenAAddress] = useState("");
  const [tokenAAmount, setTokenAAmount] = useState("");
  const [tokenAApproved, setTokenAApproved] = useState(false);
  
  // Token B state
  const [tokenBAddress, setTokenBAddress] = useState("");
  const [tokenBAmount, setTokenBAmount] = useState("");
  const [tokenBApproved, setTokenBApproved] = useState(false);
  
  // Wallet state
  const [isConnected, setIsConnected] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string>("");
  
  // DEX contract validation
  const [dexRouterAddress, setDexRouterAddress] = useState(DEFAULT_ROUTER_ADDRESS);
  const [dexFactoryAddress, setDexFactoryAddress] = useState(DEFAULT_FACTORY_ADDRESS);
  const [dexContractsValid, setDexContractsValid] = useState(false);
  const [isDexValidating, setIsDexValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  
  // Custom DEX addresses (for advanced users)
  const [useCustomAddresses, setUseCustomAddresses] = useState(false);
  const [customRouterAddress, setCustomRouterAddress] = useState("");
  const [customFactoryAddress, setCustomFactoryAddress] = useState("");
  
  // Pool status
  const [poolStatus, setPoolStatus] = useState<PoolStatus>({
    status: "idle",
    message: "Enter token information and amounts to create a pool"
  });
  
  // Network change listener
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Initial chain check
      getCurrentChainId();
      
      // Cleanup
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);
  
  const handleChainChanged = (chainIdHex: string) => {
    // Convert hex chainId to decimal
    const chainId = parseInt(chainIdHex, 16);
    setCurrentChainId(chainId);
    console.log("Chain changed to:", chainId);
    
    // Get contract addresses for this network
    updateContractAddressesForNetwork(chainId);
    
    // Revalidate contracts on new chain
    validateDexContracts();
  };
  
  const getCurrentChainId = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        setCurrentChainId(network.chainId);
        setNetworkName(network.name !== 'unknown' ? network.name : `Chain ID: ${network.chainId}`);
        
        // Update contract addresses based on network
        updateContractAddressesForNetwork(network.chainId);
      }
    } catch (error) {
      console.error("Error getting chain ID:", error);
    }
  };
  
  const updateContractAddressesForNetwork = (chainId: number) => {
    if (NETWORK_CONTRACTS[chainId]) {
      setDexRouterAddress(NETWORK_CONTRACTS[chainId].router);
      setDexFactoryAddress(NETWORK_CONTRACTS[chainId].factory);
      setNetworkName(NETWORK_CONTRACTS[chainId].name);
    } else {
      // Use defaults for unknown networks
      setDexRouterAddress(DEFAULT_ROUTER_ADDRESS);
      setDexFactoryAddress(DEFAULT_FACTORY_ADDRESS);
      setNetworkName(`Unknown Network (Chain ID: ${chainId})`);
    }
    
    // Reset custom addresses when network changes
    if (useCustomAddresses) {
      setUseCustomAddresses(false);
      setCustomRouterAddress("");
      setCustomFactoryAddress("");
    }
  };
  
  useEffect(() => {
    // Check if wallet is connected on component mount
    checkWalletConnection();
  }, []);
  
  useEffect(() => {
    // Validate DEX contracts whenever router/factory addresses change or network changes
    if (dexRouterAddress && dexFactoryAddress) {
      validateDexContracts();
    }
  }, [dexRouterAddress, dexFactoryAddress, currentChainId]);
  
  // Effect to use custom addresses when toggled
  useEffect(() => {
    if (useCustomAddresses && customRouterAddress && customFactoryAddress) {
      // When using custom addresses, override the network defaults
      setDexRouterAddress(customRouterAddress);
      setDexFactoryAddress(customFactoryAddress);
    } else if (!useCustomAddresses && currentChainId) {
      // When disabling custom addresses, revert to network defaults
      updateContractAddressesForNetwork(currentChainId);
    }
  }, [useCustomAddresses, customRouterAddress, customFactoryAddress]);
  
  const checkWalletConnection = async () => {
    try {
      const account = await connectWallet();
      setIsConnected(!!account);
      
      if (account) {
        getCurrentChainId();
      }
    } catch (error) {
      console.error("Wallet connection check failed:", error);
    }
  };
  
  const validateDexContracts = async () => {
    setIsDexValidating(true);
    setValidationMessage("");
    
    try {
      const validation = await validateDEXContracts(dexRouterAddress, dexFactoryAddress);
      setDexContractsValid(validation.isValid);
      
      if (!validation.isValid && validation.message) {
        setValidationMessage(validation.message);
        console.error("DEX validation error:", validation.message);
      }
    } catch (error) {
      console.error("DEX validation error:", error);
      setDexContractsValid(false);
      setValidationMessage(error.message || "Unknown validation error");
    } finally {
      setIsDexValidating(false);
    }
  };
  
  const handleApproveTokenA = async () => {
    if (!isConnected) {
      await connectWallet();
      setIsConnected(true);
    }
    
    setPoolStatus({
      status: "approving",
      message: "Approving Token A..."
    });
    
    try {
      const success = await approveToken(
        tokenAAddress, 
        dexRouterAddress,
        tokenAAmount,
        (status) => {
          setPoolStatus({
            status: "approving",
            message: status
          });
        }
      );
      
      if (success) {
        setTokenAApproved(true);
        toast.success("Token A approved successfully!");
        
        setPoolStatus({
          status: "idle",
          message: "Token A approved. Proceed with Token B approval."
        });
      } else {
        // If not successful, set back to idle with a message
        setPoolStatus({
          status: "idle",
          message: "Token A approval failed. Please check the console for details."
        });
      }
    } catch (error) {
      console.error("Token A approval error:", error);
      setPoolStatus({
        status: "error",
        message: `Token A approval failed: ${error.message || error}`
      });
      toast.error(`Token A approval failed: ${error.message || error}`);
    }
  };
  
  const handleApproveTokenB = async () => {
    if (!isConnected) {
      await connectWallet();
      setIsConnected(true);
    }
    
    setPoolStatus({
      status: "approving",
      message: "Approving Token B..."
    });
    
    try {
      const success = await approveToken(
        tokenBAddress, 
        dexRouterAddress,
        tokenBAmount,
        (status) => {
          setPoolStatus({
            status: "approving",
            message: status
          });
        }
      );
      
      if (success) {
        setTokenBApproved(true);
        toast.success("Token B approved successfully!");
        
        setPoolStatus({
          status: "idle",
          message: "Tokens approved. Ready to create pool and add liquidity."
        });
      } else {
        // If not successful, set back to idle with a message
        setPoolStatus({
          status: "idle",
          message: "Token B approval failed. Please check the console for details."
        });
      }
    } catch (error) {
      console.error("Token B approval error:", error);
      setPoolStatus({
        status: "error",
        message: `Token B approval failed: ${error.message || error}`
      });
      toast.error(`Token B approval failed: ${error.message || error}`);
    }
  };
  
  const handleCreatePool = async () => {
    if (!isConnected) {
      try {
        await connectWallet();
        setIsConnected(true);
      } catch (error) {
        toast.error("Failed to connect wallet");
        return;
      }
    }
    
    if (!tokenAApproved || !tokenBApproved) {
      toast.warning("Please approve both tokens before creating the pool");
      return;
    }
    
    if (!dexContractsValid) {
      toast.error(`DEX contracts are not valid on ${networkName}. Cannot create pool.`);
      return;
    }
    
    setPoolStatus({
      status: "creating",
      message: "Creating pool and adding liquidity..."
    });
    
    try {
      const result = await createPoolAndAddLiquidity(
        tokenAAddress,
        tokenBAddress,
        tokenAAmount,
        tokenBAmount,
        dexRouterAddress,
        dexFactoryAddress,
        (status, data) => {
          if (data) {
            setPoolStatus({
              status: "success",
              message: status,
              poolAddress: data.poolAddress,
              lpTokensReceived: data.lpTokensReceived,
              txHash: data.txHash
            });
          } else {
            setPoolStatus({
              status: "creating",
              message: status
            });
          }
        }
      );
      
      if (result.success) {
        toast.success("Pool created and liquidity added successfully!");
      } else {
        setPoolStatus({
          status: "error",
          message: result.error || "Failed to create pool or add liquidity. Check console for details."
        });
        
        if (result.error) {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error("Pool creation error:", error);
      setPoolStatus({
        status: "error",
        message: `Transaction failed: ${error.message || error}`
      });
      toast.error(`Transaction failed: ${error.message || error}`);
    }
  };
  
  const toggleCustomAddresses = () => {
    setUseCustomAddresses(!useCustomAddresses);
  };
  
  const isFormValid = () => {
    return (
      isConnected &&
      dexContractsValid &&
      tokenAApproved &&
      tokenBApproved &&
      parseFloat(tokenAAmount) > 0 &&
      parseFloat(tokenBAmount) > 0
    );
  };
  
  return (
    <div className="space-y-6">
      {networkName && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center text-sm text-blue-700">
            <InfoIcon className="h-4 w-4 mr-2" />
            <p>
              <strong>Current Network:</strong> {networkName}
            </p>
          </div>
        </div>
      )}
      
      {/* Custom DEX addresses option */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useCustomAddresses"
              checked={useCustomAddresses}
              onChange={toggleCustomAddresses}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="useCustomAddresses" className="text-sm font-medium text-gray-700">
              Use custom DEX contract addresses
            </label>
          </div>
        </div>
        
        {useCustomAddresses && (
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="customRouterAddress" className="block text-xs text-gray-600">
                Router Address
              </label>
              <input
                type="text"
                id="customRouterAddress"
                value={customRouterAddress}
                onChange={(e) => setCustomRouterAddress(e.target.value)}
                placeholder="0x..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="customFactoryAddress" className="block text-xs text-gray-600">
                Factory Address
              </label>
              <input
                type="text"
                id="customFactoryAddress"
                value={customFactoryAddress}
                onChange={(e) => setCustomFactoryAddress(e.target.value)}
                placeholder="0x..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>
      
      {!dexContractsValid && !isDexValidating && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start text-sm text-amber-700">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">
                DEX contract validation failed on {networkName}
              </p>
              <p className="mt-1">
                {validationMessage || "The pool creation functionality may not work correctly. Please verify the contract addresses or try on a different network."}
              </p>
              {currentChainId && !NETWORK_CONTRACTS[currentChainId] && (
                <p className="mt-1">
                  Your current network does not have predefined DEX contracts. Use the custom addresses option to specify contract addresses for this network.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {isDexValidating && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center text-sm text-yellow-700">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
            <p>Validating DEX contracts...</p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <TokenInput
          label="Token A"
          placeholder="0x..."
          tokenAddress={tokenAAddress}
          setTokenAddress={setTokenAAddress}
          amount={tokenAAmount}
          setAmount={setTokenAAmount}
          isApproved={tokenAApproved}
          setIsApproved={setTokenAApproved}
          onApprove={handleApproveTokenA}
        />
        
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white flex items-center justify-center font-semibold">
            +
          </div>
        </div>
        
        <TokenInput
          label="Token B"
          placeholder="0x..."
          tokenAddress={tokenBAddress}
          setTokenAddress={setTokenBAddress}
          amount={tokenBAmount}
          setAmount={setTokenBAmount}
          isApproved={tokenBApproved}
          setIsApproved={setTokenBApproved}
          onApprove={handleApproveTokenB}
        />
      </div>
      
      <div className="pt-4 border-t border-gray-200">
        <CreatePoolButton
          onCreatePool={handleCreatePool}
          disabled={!isFormValid() || poolStatus.status === "creating"}
        />
      </div>
      
      <StatusArea status={poolStatus} />
    </div>
  );
};

export default LiquidityPoolForm;
