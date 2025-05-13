
/**
 * Shortens an Ethereum address for display
 * @param address The full Ethereum address
 * @returns A shortened version (e.g. 0x1234...5678)
 */
export function shortenAddress(address: string | null): string {
  if (!address) return "";
  if (address.length < 10) return address; // Return as is if too short
  
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Validates if a string is a valid Ethereum address
 * @param address The address to validate
 * @returns Boolean indicating if address is valid
 */
export function isValidEthereumAddress(address: string): boolean {
  // Basic format check (0x followed by 40 hex characters)
  if (!address || !address.match(/^0x[0-9a-fA-F]{40}$/)) {
    return false;
  }
  
  // Optional: Add checksum validation for more thorough validation
  // For now, we'll accept any address that matches the basic format
  
  return true;
}

/**
 * Formats an amount with specified decimal places
 * @param amount The amount to format
 * @param decimals Number of decimal places (default: 4)
 * @returns Formatted string representation
 */
export function formatAmount(amount: string | number, decimals: number = 4): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
}
