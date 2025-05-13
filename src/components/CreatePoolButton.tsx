
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface CreatePoolButtonProps {
  onCreatePool: () => void;
  disabled: boolean;
}

const CreatePoolButton = ({ onCreatePool, disabled }: CreatePoolButtonProps) => {
  return (
    <Button
      onClick={onCreatePool}
      disabled={disabled}
      className="w-full py-6 text-lg font-medium bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] hover:opacity-90 transition-opacity shadow-md"
    >
      {disabled && <Loader className="mr-2 h-5 w-5 animate-spin" />}
      Create Pool & Add Liquidity
    </Button>
  );
};

export default CreatePoolButton;
