import React, { useState, useEffect } from 'react';
import { SecretNetworkClient } from 'secretjs';
import { ethers } from 'ethers';

function QueryLimitOrder({ onQueryLoad }) {
  const [limitOrder, setLimitOrder] = useState({
    user: '',
    usdcAmount: '',
    targetPrice: '',
  });

  const CONTRACT_ADDRESS = "0x59a4291AfFD0AAf4Fe174d390f3b8567ED99080F";
  const USDC_TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const CONTRACT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function executeOrder(uint256 usdcAmount, uint256 targetPrice) public payable",
    "function getChainlinkPrice() public view returns (uint256)"
  ];

  useEffect(() => {
    const fetchLimitOrder = async () => {
      try {
        const secretjs = new SecretNetworkClient({
          url: 'https://lcd.testnet.secretsaturn.net',
          chainId: 'pulsar-3'
        });

        const fetchedLimitOrder = await secretjs.query.compute.queryContract({
          contract_address: 'secret15xvyk8yacfqt2y6dcycgdcpc9vcl79zp97d92j',
          code_hash: "2516b5072c613499284c9ae6fbbba8f9140f914d8da20a423a83af407afc80e1",
          query: { retrieve_limit_order: {} }
        });

        setLimitOrder({
          user: fetchedLimitOrder.user,
          usdcAmount: fetchedLimitOrder.usdc_amount,
          targetPrice: fetchedLimitOrder.target_price,
        });

        console.log(fetchedLimitOrder);
        onQueryLoad();
      } catch (error) {
        console.error('Error fetching limit order:', error);
      }
    };

    const queryTimeout = setTimeout(fetchLimitOrder, 20000); // 20 seconds delay
    return () => clearTimeout(queryTimeout);
  }, [onQueryLoad]);

  const executeLimitOrder = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask first!');
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Create USDC contract instance
      const usdcContract = new ethers.Contract(USDC_TOKEN_ADDRESS, CONTRACT_ABI, signer);

      // Create Limit Order contract instance
      const limitOrderContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const usdcAmount = ethers.utils.parseUnits(limitOrder.usdcAmount, 6); // Amount of USDC in smallest units
      const targetPrice = ethers.utils.parseUnits(limitOrder.targetPrice, 8); // Target price in USD with 8 decimals

      // Approve the limit order contract to spend USDC on behalf of the user
      const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, usdcAmount);
      await approveTx.wait();
      console.log('USDC approval transaction:', approveTx.hash);

      // Fetch the current price of ETH
      const currentPrice = await limitOrderContract.getChainlinkPrice();
      console.log('Current ETH Price (in USD with 8 decimals):', ethers.utils.formatUnits(currentPrice, 8));

      // Calculate the amount of ETH to send based on the current price
      const ethAmount = usdcAmount.mul(ethers.BigNumber.from("1000000000000000000")).div(currentPrice);

      console.log('Calculated ETH Amount (in wei):', ethAmount.toString());
      console.log('Calculated ETH Amount (in ETH):', ethers.utils.formatEther(ethAmount));

      // Ensure sufficient ETH is sent
      const executeOrderTx = await limitOrderContract.executeOrder(usdcAmount, targetPrice, {
        value: ethAmount
      });
      await executeOrderTx.wait();
      console.log('Execute order transaction:', executeOrderTx.hash);

      alert('Limit order executed successfully! See tx here: ' + executeOrderTx.hash);
    } catch (error) {
      console.error('Error executing limit order:', error);
      alert('Failed to execute limit order!');
    }
  };

  return (
    <div className="flex flex-col items-center px-6 lg:px-8 text-brand-orange mt-8">
      <div className="border-4 border-brand-orange rounded-lg p-4 " style={{ width: '460px' }}>
        <h2 className="text-lg font-bold mb-4">Confidential Limit Order Details</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium leading-6">User:</label>
          <p className="mt-1 text-brand-blue">{limitOrder.user}</p>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium leading-6">USDC Amount:</label>
          <p className="mt-1 text-brand-blue">{limitOrder.usdcAmount}</p>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium leading-6">Target Price:</label>
          <p className="mt-1 text-brand-blue">${limitOrder.targetPrice} ETH</p>
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={executeLimitOrder}
            className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Execute Limit Order on EVM
          </button>
        </div>
      </div>
    </div>
  );
}

export default QueryLimitOrder;
