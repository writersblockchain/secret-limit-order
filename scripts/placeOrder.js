require('dotenv').config();
const { ethers } = require('ethers');

// Set up provider and signer
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract addresses
const usdcTokenAddress = process.env.USDC_TOKEN_ADDRESS;
const limitOrderContractAddress = process.env.CONTRACT_ADDRESS;

// ABI for the USDC token and LimitOrder contract
const usdcAbi = [
  'function approve(address spender, uint256 amount) external returns (bool)',
];

const limitOrderAbi = [
  'function placeOrder(uint256 usdcAmount, uint256 minSepoliaAmount) external',
  'event OrderPlaced(uint256 orderId, address indexed creator, uint256 usdcAmount, uint256 minSepoliaAmount)',
];

// Create contract instances
const usdcToken = new ethers.Contract(usdcTokenAddress, usdcAbi, signer);
const limitOrderContract = new ethers.Contract(limitOrderContractAddress, limitOrderAbi, signer);

async function main() {
  const usdcAmount = ethers.utils.parseUnits('1', 6); // 1 USDC, assuming 6 decimals
  const minSepoliaAmount = ethers.utils.parseUnits('0.00003', 18); // Adjust as needed based on your requirements

  // Approve the LimitOrder contract to spend 1 USDC
  console.log('Approving USDC transfer...');
  const approvalTx = await usdcToken.approve(limitOrderContractAddress, usdcAmount, 
    {
        gasLimit: 300000 // Adjust this value as needed
      }
  );
  await approvalTx.wait();
  console.log('USDC transfer approved.');

  // Place the limit order
  console.log('Placing order...');
  const placeOrderTx = await limitOrderContract.placeOrder(usdcAmount, minSepoliaAmount);
  const placeOrderReceipt = await placeOrderTx.wait();

  // Get the order ID from the event logs
  const orderId = placeOrderReceipt.events.find(event => event.event === 'OrderPlaced').args.orderId;
  console.log(`Order placed with ID: ${orderId}`);
}

main().catch(console.error);
