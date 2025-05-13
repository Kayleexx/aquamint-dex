
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader } from "lucide-react";

interface ApproveButtonProps {
  disabled: boolean;
  isApproved: boolean;
  onApprove: () => Promise<void>; // Changed to Promise<void>
  tokenSymbol: string;
}

const ApproveButton = ({ disabled, isApproved, onApprove, tokenSymbol }: ApproveButtonProps) => {
  const [isApproving, setIsApproving] = useState(false);
  
  const handleApprove = async () => {
    if (isApproved || isApproving) return;
    
    setIsApproving(true);
    
    try {
      await onApprove();
    } catch (error) {
      console.error("Approval error:", error);
    } finally {
      setIsApproving(false);
    }
  };
  
  if (isApproved) {
    return (
      <Button className="w-full" variant="outline" disabled>
        <Check className="mr-2 h-4 w-4" />
        Approved
      </Button>
    );
  }
  
  return (
    <Button
      onClick={handleApprove}
      disabled={disabled || isApproving}
      className="w-full bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] hover:opacity-90 transition-opacity"
    >
      {isApproving ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Approving {tokenSymbol || "token"}...
        </>
      ) : (
        <>Approve {tokenSymbol || "token"}</>
      )}
    </Button>
  );
};

export default ApproveButton;
