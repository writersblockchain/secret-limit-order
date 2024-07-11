import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
export default function ExecuteOrder() {

    let placeLimitOrder = async () => {

        if (!window.ethereum) {
          alert('Please install MetaMask first!');
          return;
        }
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
  
          const CONTRACT_ADDRESS = "0xFc8858405F56B044F782B8b3e683B676cC117D69";
  
          // Smart contract ABI
  const contractABI = [
    "function placeOrder(uint256 usdcAmount, uint256 targetPrice) public",
    "function approve(address spender, uint256 amount) external returns (bool)"
  ];
  
  const usdcTokenAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  
    // Create USDC contract instance
    const usdcContract = new ethers.Contract(usdcTokenAddress, contractABI, signer);
  
  //Create Limit Order contract instance 
          const limitOrderContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        
  const usdcAmount = ethers.utils.parseUnits(limitOrder.usdcAmount, 6); // Amount of USDC in smallest units
  
  const targetPrice = ethers.utils.parseUnits(limitOrder.targetPrice, 8); // Target price in USD with 8 decimals
  
           // Approve the limit order contract to spend USDC on behalf of the user
    const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, usdcAmount);
    await approveTx.wait();
    console.log('USDC approval transaction:', approveTx.hash);
  
    // Place the limit order
    const placeOrderTx = await limitOrderContract.placeOrder(usdcAmount, targetPrice);
    await placeOrderTx.wait();
    console.log('Place order transaction:', placeOrderTx.hash);
  
  
        } catch (error) {
          console.error('Error creating limit order:', error);
          alert('Failed to create limit order!');
        }
    }
  
    let executeLimitOrder = async (orderIndex) => {
  
      if (!window.ethereum) {
        alert('Please install MetaMask first!');
        return;
      }
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
  
        const CONTRACT_ADDRESS = "0xFc8858405F56B044F782B8b3e683B676cC117D69";
  
        // Smart contract ABI
        const contractABI = [
          "function executeOrder(uint256 orderIndex) public payable",
          "function getOrderDetails(uint256 orderIndex) public view returns (address user, uint256 usdcAmount, uint256 targetPrice)",
          "function getChainlinkPrice() public view returns (uint256)"
        ];
  
  //Create Limit Order contract instance 
        const limitOrderContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
        // Fetch the current price of ETH
      const currentPrice = await limitOrderContract.getChainlinkPrice();
      
      // Fetch the order details
      const [user, usdcAmount, targetPrice] = await limitOrderContract.getOrderDetails(3);
  
      // Calculate the amount of ETH to send based on the current price
      const ethAmount = ethers.BigNumber.from(usdcAmount).mul(ethers.BigNumber.from("1000000000000000000")).div(currentPrice);
  
      console.log('Current ETH Price (in USD with 8 decimals):', ethers.utils.formatUnits(currentPrice, 8));
      console.log('Calculated ETH Amount (in wei):', ethAmount.toString());
      console.log('Calculated ETH Amount (in ETH):', ethers.utils.formatEther(ethAmount));
  
      // Ensure sufficient ETH is sent
      const executeOrderTx = await limitOrderContract.executeOrder(3, {
        value: ethAmount
      });
      await executeOrderTx.wait();
      console.log('Execute order transaction:', executeOrderTx.hash);
   
      } catch (error) {
        console.error('Error executing limit order:', error);
        alert('Failed to execute limit order!');
      }
  };


  return (
    <div>ExecuteOrder</div>
  )
}
