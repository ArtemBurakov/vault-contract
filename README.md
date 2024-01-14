# Vault Contract

This project includes a smart contract, deployment scripts, and tests. It is fully configured to deploy the smart contract on different testnets and mainnet.

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/ArtemBurakov/vault-contract.git
cd vault-contract
```

### Install Dependencies

```bash
npm install
```

### Configure .env File

Create a .env file in the root directory of the project and add the following variables:

```bash
OWNER_INCOME_PERCENTAGE=   # Owner income percentage for the smart contract
PRIVATE_KEY=   # Private key for deploying the smart contract

INFURA_KEY=   # Infura API key for connecting to the Ethereum network
ETHERSCAN_KEY=   # Etherscan API key for smart contract verification
```

## Available Scripts

```bash
# Compile the smart contracts
npm run compile

# Clean the build artifacts
npm run clean

# Run tests on the localhost network
npm run test

# Start a private network for development
npm run private-network

# Deploy the smart contract on the localhost network
npm run deploy-localhost

# Deploy the smart contract on the Goerli testnet
npm run deploy-goerli

# Deploy the smart contract on the Sepolia testnet
npm run deploy-sepolia
```

> All commands can be found in package.json file.

## Deploying the Smart Contract

To deploy the smart contract, you can use the available deployment scripts. For example, to deploy on the Goerli testnet:

```bash
npm run deploy-goerli
```

## Verifying the Smart Contract

After deployment, you can verify the smart contract using the following commands:

```bash
# Verify with commission percentage as an argument
npx hardhat verify --network goerli CONTRACT_ADDRESS "<COMMISSION_PERCENTAGE>"

# Verify using a file for smart contract arguments
npx hardhat verify --network goerli --constructor-args scripts/arguments.js CONTRACT_ADDRESS
```
