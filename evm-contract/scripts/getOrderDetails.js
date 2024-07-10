require('dotenv').config();
const { ethers } = require('ethers');

// Setup provider and signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Smart contract ABI
const abi = [
  "function getOrderDetails(uint256 orderIndex) public view returns (address user, uint256 usdcAmount, uint256 targetPrice)"
];

// Smart contract address
const contractAddress = process.env.CONTRACT_ADDRESS;

// Function to get order details
async function getOrderDetails(orderIndex) {
  // Create contract instance
  const limitOrderContract = new ethers.Contract(contractAddress, abi, provider);

  // Call the getOrderDetails function
  try {
    const [user, usdcAmount, targetPrice] = await limitOrderContract.getOrderDetails(orderIndex);

    // Log the details
    console.log('Order Details:');
    console.log('User Address:', user);
    console.log('USDC Amount (in smallest units):', usdcAmount.toString());
    console.log('Target Price (in USD with 8 decimals):', targetPrice.toString());

    // Optionally, convert to more readable formats
    const usdcAmountInUsdc = ethers.utils.formatUnits(usdcAmount, 6); // Convert smallest units to USDC
    const targetPriceInUsd = ethers.utils.formatUnits(targetPrice, 8); // Convert price to USD

    console.log('USDC Amount (in USDC):', usdcAmountInUsdc);
    console.log('Target Price (in USD):', targetPriceInUsd);
  } catch (error) {
    console.error('Error fetching order details:', error);
  }
}

// Example usage: Get details of order at index 0
getOrderDetails(3).catch(console.error);
