# Deploy on GOERLI

# Before
Update LAYER2_ADDRESS in .env for Loopring Layer 2 (see .env.example)
Make sure ADDRESS and PRIVATE_KEY in .env are set

# Clean
npx hardhat clean

# Test connection
npx hardhat --network goerli accounts

# Deploy contract
npx hardhat --network goerli run scripts/deploy.ts
Update CONTRACT_ADDRESS in .env with output.

# Test contract
npx hardhat --network goerli minters

# Update base url
npx hardhat --network goerli seturl --url ipfs://QmSSgZvpPTAfVR8HPde4j4quZCf86DW2PrtH1YWnSPZWkd/

# Mint a id
npx hardhat --network goerli mint --id 1

# Verify
npx hardhat --network goerli verify2
