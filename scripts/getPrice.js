const { ethers } = require("hardhat");
require("dotenv").config();

async function getPrice() {
  const limitOrderAddress = process.env.CONTRACT_ADDRESS; // Replace with your deployed contract's address

  let LimitOrder = await ethers.getContractFactory("LimitOrder");
  const limitOrder = await LimitOrder.attach(limitOrderAddress);

  try {
    const price = await limitOrder.getSepoliaPrice();
    console.log("Current price:", ethers.utils.formatUnits(price, 6)); // Assuming price feed has 6 decimals
  } catch (error) {
    console.error("Error getting price:", error);
  }
}

getPrice();