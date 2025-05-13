import LiquidityPoolForm from "@/components/LiquidityPoolForm";
import WalletStatus from "@/components/WalletStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";

const CreatePool = () => {
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if MetaMask or another wallet is installed
    const checkWalletProvider = () => {
      if (window.ethereum) {
        setHasWallet(true);
      } else {
        setHasWallet(false);
      }
    };
    
    checkWalletProvider();
    
    // Also check if the window.ethereum object gets injected later
    const walletCheckInterval = setInterval(() => {
      if (window.ethereum && hasWallet === false) {
        setHasWallet(true);
        clearInterval(walletCheckInterval);
      }
    }, 1000);
    
    return () => clearInterval(walletCheckInterval);
  }, [hasWallet]);
  
  useEffect(() => {
    // Show toast message if no wallet is found
    if (hasWallet === false) {
      toast.warning(
        "No Ethereum wallet detected. Please install MetaMask to use this application.",
        {
          duration: 8000,
          action: {
            label: "Install MetaMask",
            onClick: () => window.open("https://metamask.io/download/", "_blank")
          }
        }
      );
    }
  }, [hasWallet]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-[#D3E4FD] flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-3xl mb-6">
        <div className="flex justify-between items-center mb-4">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          <WalletStatus />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] bg-clip-text text-transparent">
          AquaMint
        </h1>
        <p className="text-center text-gray-600 mt-2">
          Create liquidity pools with ease
        </p>
      </header>
      
      {hasWallet === false && (
        <Card className="w-full max-w-3xl mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <p className="font-medium text-orange-800">Ethereum Wallet Required</p>
              <p className="text-orange-700 text-sm">
                To interact with this application, you need an Ethereum wallet like MetaMask. 
                Please install a wallet to create liquidity pools.
              </p>
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-[#33C3F0] hover:underline"
              >
                Install MetaMask
              </a>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="w-full max-w-3xl shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-[#F1F1F1] to-[#fff] rounded-t-lg">
          <CardTitle className="text-2xl text-[#1A1F2C]">Create New Liquidity Pool</CardTitle>
          <CardDescription>
            Add token pairs and initial liquidity to create a new pool
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <LiquidityPoolForm />
        </CardContent>
      </Card>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>AquaMint DEX © 2025. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CreatePool;
