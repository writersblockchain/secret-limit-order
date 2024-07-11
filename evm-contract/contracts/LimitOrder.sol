// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract LimitOrder {
    // Chainlink Price Feed
    AggregatorV3Interface internal priceFeed;

    IERC20 public usdcToken;

    constructor(address _usdcToken, address _priceFeed) {
        usdcToken = IERC20(_usdcToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function executeOrder(uint256 usdcAmount, uint256 targetPrice) public payable {
        // Ensure the contract is approved to spend the user's USDC
        require(usdcToken.allowance(msg.sender, address(this)) >= usdcAmount, "USDC allowance too low");

        // Get the current ETH price
        uint256 currentPrice = getChainlinkPrice();

        // Check if the current price meets the target price condition
        require(currentPrice >= targetPrice, "Current price is below target price");

        // Calculate the amount of ETH to transfer based on the current price
        uint256 ethAmount = (usdcAmount * 1e18) / currentPrice; // 1e18 to handle decimals

        // Ensure sufficient ETH is sent
        require(msg.value >= ethAmount, "Insufficient ETH sent");

        // Transfer USDC from sender to msg.sender
        require(usdcToken.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");

        // Transfer USDC from contract to msg.sender
        require(usdcToken.transfer(msg.sender, usdcAmount), "USDC transfer to user failed");

        // Transfer ETH to order user
        payable(msg.sender).transfer(ethAmount);

        // Refund any excess ETH sent
        if (msg.value > ethAmount) {
            payable(msg.sender).transfer(msg.value - ethAmount);
        }
    }

    function getChainlinkPrice() public view returns (uint256) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return uint256(price);
    }
}
