const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // USDC token address on Sepolia
  const PriceFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Chainlink Price Feed address for Sepolia ETH/USDC

  const LimitOrder = await ethers.getContractFactory("LimitOrder");
  const limitOrder = await LimitOrder.deploy(USDC, PriceFeed);

  console.log("LimitOrder contract deployed to:", limitOrder.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });