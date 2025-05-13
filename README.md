
# 🌊 AquaMint – Liquidity Pool Creator

AquaMint is a sleek, on-chain interface to create new ERC-20 token pairs and bootstrap liquidity pools on a Uniswap-style DEX (testnet only). Designed for DEX builders, token teams, and Web3 hackers, AquaMint simplifies the process of launching a new trading market by combining pool creation and liquidity provisioning into a single flow.


## 🎯 Features

- ✅ Input custom ERC-20 token addresses (Token A & Token B)
- ✅ Request token allowances from the user’s wallet
- ✅ “Create Pool” function via the DEX Factory contract
- ✅ Automatically call Router to add liquidity
- ✅ Display:
  - Pool address
  - LP tokens received
  - User’s share of the pool
  - Etherscan/testnet explorer links
- ✅ Seamless experience on Goerli/Sepolia (testnet)

---

## 🧱 Architecture

**Frontend:**  
- Built with **React** + **TailwindCSS**  
- Uses **ethers.js** for blockchain interactions  
- Connects to MetaMask for token approvals & transactions  

**Backend / Blockchain:**  
- Calls existing DEX **Factory** and **Router** contracts (UniswapV2 or SushiRouter-compatible)  
- Uses **Hardhat** scripts for local deployment/testing  
- No new contracts are required — just integration

---

## 🧪 How It Works

1. **User Connects Wallet**
2. **Inputs Token A and Token B Addresses**
3. **Approves Both Tokens for Spending**
4. **Clicks “Create Pool”**
   - Calls `createPair(tokenA, tokenB)` on Factory
   - Calls `addLiquidity(...)` on Router with provided amounts
5. **Result:**
   - New pool is created
   - User receives LP tokens
   - Pool address and LP balance are shown in the UI

---

## 📦 Tech Stack

| Layer       | Tech                         |
|-------------|------------------------------|
| Frontend    | React, TailwindCSS, Ethers.js|
| Blockchain  | Solidity (existing DEX contracts) |
| Tooling     | Hardhat, MetaMask, Testnet Faucet |
| Network     | Goerli or Sepolia Testnet    |

---

## 🔧 Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/Kayleexx/aquamint-dex.git
cd aquamint-dex


````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure `.env`

```bash
VITE_ROUTER_ADDRESS=0xYourRouterAddress
VITE_FACTORY_ADDRESS=0xYourFactoryAddress
```

### 4. Run the app

```bash
npm run dev
```

> 🧠 Make sure to fund your wallet with testnet ETH and hold some testnet ERC-20 tokens.


## Demo video
https://github.com/user-attachments/assets/6b971519-40d9-4086-8193-a896cebe76be

