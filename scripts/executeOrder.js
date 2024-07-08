require('dotenv').config();
const { ethers } = require('ethers');

// Setup provider and signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Smart contract ABI
const abi = [
  "function executeOrder(uint256 orderIndex) public payable"
];

// Smart contract address
const contractAddress = process.env.CONTRACT_ADDRESS;

// Function to execute order
async function executeOrder(orderIndex, ethAmount) {
  // Create contract instance
  const limitOrderContract = new ethers.Contract(contractAddress, abi, signer);

  // Execute the order
  try {
    const executeOrderTx = await limitOrderContract.executeOrder(orderIndex, {
      value: ethAmount
    });
    await executeOrderTx.wait();
    console.log('Execute order transaction:', executeOrderTx.hash);
  } catch (error) {
    console.error('Error executing order:', error);
  }
}

// Example usage: Execute order at index 0 with 0.001 ETH
const ethAmount = ethers.utils.parseEther("0.31", 6); // Amount of ETH
executeOrder(0, ethAmount).catch(console.error);
