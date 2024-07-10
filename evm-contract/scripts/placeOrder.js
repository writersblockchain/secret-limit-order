require('dotenv').config();
const { ethers } = require('ethers');

// Setup provider and signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Smart contract ABI
const abi = [
  "function placeOrder(uint256 usdcAmount, uint256 targetPrice) public",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

// Smart contract address
const contractAddress = process.env.CONTRACT_ADDRESS;

// USDC token contract address
const usdcTokenAddress = process.env.USDC_TOKEN_ADDRESS;

// Order details
const usdcAmount = ethers.utils.parseUnits("1", 6); // Amount of USDC in smallest units
const targetPrice = ethers.utils.parseUnits("2900", 8); // Target price in USD with 8 decimals

// Example BigNumber values
const usdcAmountHex = ethers.BigNumber.from(usdcAmount);
const targetPriceHex = ethers.BigNumber.from(targetPrice);

// Convert to more readable formats
const usdcAmountInUsdc = ethers.utils.formatUnits(usdcAmountHex, 6); // Convert smallest units to USDC
const targetPriceInUsd = ethers.utils.formatUnits(targetPriceHex, 8); // Convert price to USD

console.log('usdcAmount (in USDC):', usdcAmountInUsdc);
console.log('targetPrice (in USD):', targetPriceInUsd);

async function placeLimitOrder() {
  // Create contract instance
  const limitOrderContract = new ethers.Contract(contractAddress, abi, signer);

  // Create USDC contract instance
  const usdcContract = new ethers.Contract(usdcTokenAddress, abi, signer);

  // Approve the limit order contract to spend USDC on behalf of the user
  const approveTx = await usdcContract.approve(contractAddress, usdcAmount);
  await approveTx.wait();
  console.log('USDC approval transaction:', approveTx.hash);

  // Place the limit order
  const placeOrderTx = await limitOrderContract.placeOrder(usdcAmount, targetPrice);
  await placeOrderTx.wait();
  console.log('Place order transaction:', placeOrderTx.hash);
}

placeLimitOrder().catch(console.error);
