require('dotenv').config();
const { ethers } = require('ethers');

// Setup provider and signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Smart contract ABI
const abi = [
  "function placeOrder(uint256 ethAmount, uint256 usdcAmount) public",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

// Smart contract address
const contractAddress = process.env.CONTRACT_ADDRESS;

// USDC token contract address
const usdcTokenAddress = process.env.USDC_TOKEN_ADDRESS;

// Order details
const ethAmount = ethers.utils.parseEther("0.31", 6); // Amount of ETH in wei
const usdcAmount = ethers.utils.parseUnits("1", 6); // Amount of USDC in smallest units

// Example BigNumber values
const ethAmountHex = ethers.BigNumber.from(ethAmount);
const usdcAmountHex = ethers.BigNumber.from(usdcAmount);

//Convert to more readable formats
const ethAmountInEth = ethers.utils.formatEther(ethAmountHex); // Convert wei to ETH
const usdcAmountInUsdc = ethers.utils.formatUnits(usdcAmountHex, 6); // Convert smallest units to USDC

console.log('ethAmount (in ETH):', ethAmountInEth);
console.log('usdcAmount (in USDC):', usdcAmountInUsdc);


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
  const placeOrderTx = await limitOrderContract.placeOrder(ethAmount, usdcAmount);
  await placeOrderTx.wait();
  console.log('Place order transaction:', placeOrderTx.hash);
}

placeLimitOrder().catch(console.error);
