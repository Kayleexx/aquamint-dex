
import { ethers } from "ethers";

// ABI snippets for the contracts we'll interact with
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  "function createPair(address tokenA, address tokenB) external returns (address pair)"
];

const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)"
];

const PAIR_ABI = [
  "function balanceOf(address owner) external view returns (uint)",
  "function decimals() external pure returns (uint8)"
];

// Check if an address is a valid ERC20 token
export async function isValidERC20Token(tokenAddress: string): Promise<boolean> {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Try to call basic ERC20 functions to validate
    await Promise.all([
      tokenContract.decimals(),
      tokenContract.symbol()
    ]);
    
    return true;
  } catch (error) {
    console.error("Invalid ERC20 token:", error);
    return false;
  }
}

/**
 * Validates DEX contract addresses
 */
export async function validateDEXContracts(
  routerAddress: string,
  factoryAddress: string
): Promise<{ 
  isValid: boolean; 
  message?: string; 
}> {
  try {
    if (!window.ethereum) {
      return { 
        isValid: false, 
        message: "No Ethereum wallet detected. Please install MetaMask or another wallet."
      };
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get network information first
    const network = await provider.getNetwork();
    console.log("Current network:", network);
    
    // Check if router contract exists (has deployed bytecode)
    const routerCode = await provider.getCode(routerAddress);
    if (routerCode === '0x') {
      return { 
        isValid: false, 
        message: `Router contract does not exist at ${routerAddress} on network ${network.name} (${network.chainId})`
      };
    }
    
    // Check if factory contract exists
    const factoryCode = await provider.getCode(factoryAddress);
    if (factoryCode === '0x') {
      return { 
        isValid: false, 
        message: `Factory contract does not exist at ${factoryAddress} on network ${network.name} (${network.chainId})`
      };
    }
    
    // Try to create contract instances and check if they support the expected interfaces
    try {
      const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
      const router = new ethers.Contract(routerAddress, ROUTER_ABI, provider);
      
      // For testnets, simply having code at the address is enough
      // For production, we would do more extensive validation
      
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        message: `Contracts at the provided addresses don't match expected interfaces: ${error.message}`
      };
    }
  } catch (error) {
    console.error("DEX contract validation error:", error);
    return { 
      isValid: false, 
      message: `Failed to validate DEX contracts: ${error.message || "Unknown error"}`
    };
  }
}

/**
 * Approves DEX Router to spend tokens
 */
export async function approveToken(
  tokenAddress: string,
  routerAddress: string,
  amount: string,
  onStatus: (status: string) => void
): Promise<boolean> {
  try {
    onStatus(`Validating token contract...`);
    
    // First check if it's a valid ERC20 token
    const isValid = await isValidERC20Token(tokenAddress);
    if (!isValid) {
      throw new Error("Invalid ERC20 token. The address may not be a token contract or may not implement the ERC20 standard.");
    }
    
    onStatus(`Requesting approval for ${amount}...`);
    
    // Request provider from browser
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Get the token contract
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    
    // Convert amount to proper format with decimals
    const decimals = await tokenContract.decimals();
    const tokenSymbol = await tokenContract.symbol();
    const parsedAmount = ethers.utils.parseUnits(amount, decimals);
    
    // Send the approval transaction
    onStatus(`Approving ${tokenSymbol}...`);
    const tx = await tokenContract.approve(routerAddress, parsedAmount);
    
    // Wait for transaction to be mined
    onStatus(`Waiting for approval confirmation...`);
    await tx.wait();
    
    onStatus(`${tokenSymbol} approved successfully!`);
    return true;
  } catch (error) {
    console.error("Approval error:", error);
    const errorMessage = error.message || "Unknown error";
    const userMessage = errorMessage.includes("user rejected") 
      ? "Transaction was rejected by the user."
      : errorMessage.includes("call revert exception") 
        ? "Failed to interact with token contract. Please verify the address is a valid ERC20 token."
        : `Approval failed: ${errorMessage}`;
    
    onStatus(userMessage);
    return false;
  }
}

/**
 * Creates a liquidity pool and adds liquidity for the token pair
 */
export async function createPoolAndAddLiquidity(
  tokenAAddress: string,
  tokenBAddress: string,
  amountA: string,
  amountB: string,
  routerAddress: string,
  factoryAddress: string,
  onStatus: (status: string, data?: any) => void
): Promise<{
  success: boolean;
  poolAddress?: string;
  lpTokensReceived?: string;
  txHash?: string;
  error?: string;
}> {
  try {
    onStatus("Connecting to wallet...");
    
    // Validate DEX contracts
    const dexValidation = await validateDEXContracts(routerAddress, factoryAddress);
    if (!dexValidation.isValid) {
      throw new Error(dexValidation.message || "Invalid DEX contracts");
    }
    
    // Validate token contracts
    onStatus("Validating token contracts...");
    const tokenAValid = await isValidERC20Token(tokenAAddress);
    if (!tokenAValid) {
      throw new Error("Token A is not a valid ERC20 token");
    }
    
    const tokenBValid = await isValidERC20Token(tokenBAddress);
    if (!tokenBValid) {
      throw new Error("Token B is not a valid ERC20 token");
    }
    
    // Request provider from browser
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Get contracts
    const tokenA = new ethers.Contract(tokenAAddress, ERC20_ABI, signer);
    const tokenB = new ethers.Contract(tokenBAddress, ERC20_ABI, signer);
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);
    const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer);
    
    // Get token details
    const decimalsA = await tokenA.decimals();
    const decimalsB = await tokenB.decimals();
    const symbolA = await tokenA.symbol();
    const symbolB = await tokenB.symbol();
    
    // Parse amounts with proper decimals
    const parsedAmountA = ethers.utils.parseUnits(amountA, decimalsA);
    const parsedAmountB = ethers.utils.parseUnits(amountB, decimalsB);
    
    // Check if pair already exists
    onStatus(`Checking if ${symbolA}/${symbolB} pool exists...`);
    let pairAddress;
    
    try {
      pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
    } catch (error) {
      console.error("Error checking pair:", error);
      throw new Error("Failed to check if pool exists. The factory contract may not be valid or compatible.");
    }
    
    // If pair doesn't exist, create it
    if (pairAddress === ethers.constants.AddressZero) {
      onStatus(`Creating new ${symbolA}/${symbolB} pool...`);
      try {
        const createPairTx = await factory.createPair(tokenAAddress, tokenBAddress);
        await createPairTx.wait();
        
        // Get the new pair address
        pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
        onStatus(`New pool created at: ${pairAddress}`);
      } catch (error) {
        console.error("Pool creation error:", error);
        throw new Error("Failed to create new pool. The transaction may have been rejected or the factory contract is incompatible.");
      }
    } else {
      onStatus(`Pool already exists at: ${pairAddress}`);
    }
    
    // Calculate slippage (5% for demo purposes)
    const slippageTolerance = 5; // 5%
    const amountAMin = parsedAmountA.mul(100 - slippageTolerance).div(100);
    const amountBMin = parsedAmountB.mul(100 - slippageTolerance).div(100);
    
    // Set deadline to 20 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 20 * 60;
    
    // Add liquidity
    onStatus(`Adding liquidity for ${symbolA}/${symbolB}...`);
    try {
      const tx = await router.addLiquidity(
        tokenAAddress,
        tokenBAddress,
        parsedAmountA,
        parsedAmountB,
        amountAMin,
        amountBMin,
        userAddress,
        deadline
      );
      
      // Wait for transaction to complete
      onStatus("Waiting for transaction confirmation...");
      const receipt = await tx.wait();
      
      // Get LP tokens received
      const pair = new ethers.Contract(pairAddress, PAIR_ABI, signer);
      const lpBalance = await pair.balanceOf(userAddress);
      const lpDecimals = await pair.decimals();
      const lpTokensReceived = ethers.utils.formatUnits(lpBalance, lpDecimals);
      
      onStatus("Liquidity added successfully!", {
        poolAddress: pairAddress,
        lpTokensReceived,
        txHash: receipt.transactionHash
      });
      
      return {
        success: true,
        poolAddress: pairAddress,
        lpTokensReceived,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error("Liquidity addition error:", error);
      throw new Error("Failed to add liquidity. The transaction may have been rejected or the router contract is incompatible.");
    }
  } catch (error) {
    console.error("Liquidity addition error:", error);
    const errorMessage = error.message || "Unknown error";
    const userMessage = errorMessage.includes("user rejected") 
      ? "Transaction was rejected by user."
      : errorMessage;
    
    onStatus(`Transaction failed: ${userMessage}`);
    return { success: false, error: userMessage };
  }
}

// Initialize Web3 and request account access
export async function connectWallet(): Promise<string | null> {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("No Ethereum wallet found. Please install MetaMask or another wallet.");
    }
    
    // Request account access
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    
    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }
    
    return accounts[0];
  } catch (error) {
    console.error("Connection error:", error);
    return null;
  }
}

// Get token balance and symbol
export async function getTokenInfo(
  tokenAddress: string
): Promise<{ symbol: string; balance: string; decimals: number } | null> {
  try {
    // Validate if it's a token first
    const isValid = await isValidERC20Token(tokenAddress);
    if (!isValid) {
      throw new Error("Not a valid ERC20 token");
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();
    const rawBalance = await tokenContract.balanceOf(userAddress);
    const balance = ethers.utils.formatUnits(rawBalance, decimals);
    
    return { symbol, balance, decimals };
  } catch (error) {
    console.error("Error fetching token info:", error);
    return null;
  }
}
