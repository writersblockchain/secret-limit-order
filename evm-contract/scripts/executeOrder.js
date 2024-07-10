require('dotenv').config();
const { ethers } = require('ethers');

// Setup provider and signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Smart contract ABI
const abi = [
  "function executeOrder(uint256 orderIndex) public payable",
  "function getOrderDetails(uint256 orderIndex) public view returns (address user, uint256 usdcAmount, uint256 targetPrice)",
  "function getChainlinkPrice() public view returns (uint256)"
];

// Smart contract address
const contractAddress = process.env.CONTRACT_ADDRESS;

// Function to execute order
async function executeOrder(orderIndex) {
  // Create contract instance
  const limitOrderContract = new ethers.Contract(contractAddress, abi, signer);

  try {
    // Fetch the current price of ETH
    const currentPrice = await limitOrderContract.getChainlinkPrice();
    
    // Fetch the order details
    const [user, usdcAmount, targetPrice] = await limitOrderContract.getOrderDetails(orderIndex);

    // Calculate the amount of ETH to send based on the current price
    const ethAmount = ethers.BigNumber.from(usdcAmount).mul(ethers.BigNumber.from("1000000000000000000")).div(currentPrice);

    console.log('Current ETH Price (in USD with 8 decimals):', ethers.utils.formatUnits(currentPrice, 8));
    console.log('Calculated ETH Amount (in wei):', ethAmount.toString());
    console.log('Calculated ETH Amount (in ETH):', ethers.utils.formatEther(ethAmount));

    // Ensure sufficient ETH is sent
    const executeOrderTx = await limitOrderContract.executeOrder(orderIndex, {
      value: ethAmount
    });
    await executeOrderTx.wait();
    console.log('Execute order transaction:', executeOrderTx.hash);
  } catch (error) {
    console.error('Error executing order:', error);
  }
}

// Example usage: Execute order at index 0
executeOrder(1).catch(console.error);
