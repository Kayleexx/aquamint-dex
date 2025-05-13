
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ApproveButton from "./ApproveButton";
import { getTokenInfo, isValidERC20Token } from "@/utils/liquidityUtils";
import { toast } from "@/components/ui/sonner";
import { isValidEthereumAddress, formatAmount } from "@/utils/addressUtils";
import { Loader } from "lucide-react";

interface TokenInputProps {
  label: string;
  placeholder: string;
  tokenAddress: string;
  setTokenAddress: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  isApproved: boolean;
  setIsApproved: (value: boolean) => void;
  onApprove: (address: string, amount: string) => Promise<void>;
}

const TokenInput = ({
  label,
  placeholder,
  tokenAddress,
  setTokenAddress,
  amount,
  setAmount,
  isApproved,
  setIsApproved,
  onApprove
}: TokenInputProps) => {
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  
  useEffect(() => {
    // Reset state when address changes
    setTokenSymbol("");
    setTokenBalance("");
    setIsValidAddress(false);
    setIsValidToken(false);
    setValidationError("");
    
    // Don't validate empty strings
    if (!tokenAddress) return;
    
    // Basic validation check
    if (isValidEthereumAddress(tokenAddress)) {
      setIsValidAddress(true);
      validateTokenAndFetchInfo();
    } else {
      setValidationError("Invalid Ethereum address format. Address must start with 0x followed by 40 hex characters.");
    }
  }, [tokenAddress]);
  
  const validateTokenAndFetchInfo = async () => {
    if (!window.ethereum) {
      toast.warning("No Ethereum wallet detected. Please install MetaMask.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // First check if it's a valid ERC20 token
      const isValid = await isValidERC20Token(tokenAddress);
      
      if (!isValid) {
        setValidationError("Address is not a valid ERC20 token. It may not implement the required token interface.");
        return;
      }
      
      setIsValidToken(true);
      const tokenInfo = await getTokenInfo(tokenAddress);
      
      if (tokenInfo) {
        setTokenSymbol(tokenInfo.symbol);
        setTokenBalance(tokenInfo.balance);
      } else {
        setValidationError("Could not load token information. The address may be valid but not a token contract.");
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setValidationError(`Failed to validate token: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMaxAmount = () => {
    if (tokenBalance) {
      setAmount(tokenBalance);
    }
  };
  
  const handleApprove = async () => {
    if (!isValidAddress || !isValidToken || !amount || parseFloat(amount) <= 0) return;
    
    try {
      await onApprove(tokenAddress, amount);
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(`Failed to approve: ${error.message}`);
    }
  };
  
  return (
    <div className="space-y-3 p-4 rounded-lg border border-gray-200 bg-white">
      <div>
        <Label htmlFor={`${label.toLowerCase()}-address`} className="text-sm font-medium">
          {label} Address
        </Label>
        <Input
          id={`${label.toLowerCase()}-address`}
          placeholder={placeholder}
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          className={`mt-1 ${validationError ? "border-red-300" : ""}`}
        />
        {validationError && (
          <p className="mt-1 text-xs text-red-500">
            {validationError}
          </p>
        )}
        {isLoading && (
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Loader className="h-3 w-3 mr-1 animate-spin" />
            Validating token...
          </div>
        )}
        {tokenSymbol && (
          <div className="mt-1 text-sm text-[#7E69AB] font-medium">
            {tokenSymbol} (Valid ERC20 token)
          </div>
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`${label.toLowerCase()}-amount`} className="text-sm font-medium">
            Amount
          </Label>
          {tokenBalance && (
            <div className="text-xs text-gray-500 flex items-center">
              Balance: {formatAmount(tokenBalance)}
              <button 
                onClick={handleMaxAmount} 
                className="ml-1 text-xs text-[#33C3F0] font-medium hover:underline"
              >
                MAX
              </button>
            </div>
          )}
        </div>
        <Input
          id={`${label.toLowerCase()}-amount`}
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!isValidToken}
          className="mt-1"
          min="0"
          step="0.000001"
        />
      </div>
      
      <ApproveButton
        disabled={!isValidToken || !amount || parseFloat(amount) <= 0}
        isApproved={isApproved}
        onApprove={handleApprove}
        tokenSymbol={tokenSymbol}
      />
    </div>
  );
};

export default TokenInput;
