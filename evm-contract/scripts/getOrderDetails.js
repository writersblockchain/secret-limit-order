require('dotenv').config();
const { ethers } = require('ethers');

// Setup provider and signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Smart contract ABI
const abi = [
  "function getOrderDetails(uint256 orderIndex) public view returns (address user, uint256 ethAmount, uint256 usdcAmount)"
];

// Smart contract address
const contractAddress = process.env.CONTRACT_ADDRESS;

// Function to get order details
async function getOrderDetails(orderIndex) {
  // Create contract instance
  const limitOrderContract = new ethers.Contract(contractAddress, abi, provider);

  // Call the getOrderDetails function
  try {
    const [user, ethAmount, usdcAmount] = await limitOrderContract.getOrderDetails(orderIndex);

    // Log the details
    console.log('Order Details:');
    console.log('User Address:', user);
    console.log('ETH Amount (in wei):', ethAmount.toString());
    console.log('USDC Amount (in smallest units):', usdcAmount.toString());

    // Optionally, convert to more readable formats
    const ethAmountInEth = ethers.utils.formatEther(ethAmount); // Convert wei to ETH
    const usdcAmountInUsdc = ethers.utils.formatUnits(usdcAmount, 6); // Convert smallest units to USDC

    console.log('ETH Amount (in ETH):', ethAmountInEth);
    console.log('USDC Amount (in USDC):', usdcAmountInUsdc);
  } catch (error) {
    console.error('Error fetching order details:', error);
  }
}

// Example usage: Get details of order at index 0
getOrderDetails(0).catch(console.error);
