require('dotenv').config();
const { ethers } = require('ethers');

// Set up provider and signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract addresses
const limitOrderContractAddress = process.env.CONTRACT_ADDRESS;

// ABI for the LimitOrder contract
const limitOrderAbi = [
  'function fulfillOrder(uint256 orderId) external payable',
  'function getSepoliaPrice() public view returns (uint256)',
  'function getOrder(uint256 orderId) external view returns (address, uint256, uint256, bool)',
];

// Create contract instance
const limitOrderContract = new ethers.Contract(limitOrderContractAddress, limitOrderAbi, signer);

async function fulfillOrder(orderId) {
  try {
    // Fetch the current Sepolia price
    const currentPrice = await limitOrderContract.getSepoliaPrice();
    console.log(`Current Sepolia price: ${currentPrice.toString()}`);

    // Retrieve order details
    const order = await limitOrderContract.getOrder(orderId);
    const creator = order[0];
    const usdcAmount = order[1];
    const minSepoliaAmount = order[2];
    const fulfilled = order[3];

    if (fulfilled) {
      console.log(`Order ${orderId} is already fulfilled.`);
      return;
    }

    console.log(`Order details - Creator: ${creator}, USDC Amount: ${usdcAmount.toString()}, Min Sepolia Amount: ${minSepoliaAmount.toString()}, Fulfilled: ${fulfilled}`);

    // Calculate the required Sepolia amount
    const requiredSepoliaAmount = usdcAmount.mul(currentPrice).div(ethers.utils.parseUnits('1', 6)); // Adjust based on price feed decimals
    console.log(`Required Sepolia amount for ${ethers.utils.formatUnits(usdcAmount, 6)} USDC: ${ethers.utils.formatUnits(requiredSepoliaAmount, 18)}`);

    // Check if the current price fulfills the order requirements
    if (requiredSepoliaAmount.lte(minSepoliaAmount)) {
      console.log(`Current price fulfills the order requirements. Fulfilling order ${orderId}...`);
      const fulfillOrderTx = await limitOrderContract.fulfillOrder(orderId, {
        value: requiredSepoliaAmount,
        gasLimit: 3000000 // Adjust this value as needed
      });
      await fulfillOrderTx.wait();
      console.log(`Order ${orderId} fulfilled.`);
    } else {
      console.log('Current price does not fulfill the order requirements.');
    }
  } catch (error) {
    console.error(`Failed to fulfill order ${orderId}:`, error);
  }
}

const orderId = 0; // Replace with the actual order ID you want to fulfill
fulfillOrder(orderId).catch(console.error);
