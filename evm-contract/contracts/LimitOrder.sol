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
    struct Order {
        address user;
        uint256 ethAmount;
        uint256 usdcAmount;
    }

     // Chainlink Price Feed
    AggregatorV3Interface internal priceFeed;

    IERC20 public usdcToken;
    Order[] public orders;

    constructor(address _usdcToken, address _priceFeed) {
        usdcToken = IERC20(_usdcToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function placeOrder(uint256 ethAmount, uint256 usdcAmount) public {
        // Ensure the contract is approved to spend the user's USDC
        require(usdcToken.allowance(msg.sender, address(this)) >= usdcAmount, "USDC allowance too low");
        
        orders.push(Order({
            user: msg.sender,
            ethAmount: ethAmount,
            usdcAmount: usdcAmount
        }));
    }

    function executeOrder(uint256 orderIndex) public payable {
        Order storage order = orders[orderIndex];
        require(msg.value >= order.ethAmount, "Insufficient ETH sent");

        // Transfer USDC from order user to msg.sender
        require(usdcToken.transferFrom(order.user, msg.sender, order.usdcAmount), "USDC transfer failed");

        // Transfer ETH to order user
        payable(order.user).transfer(order.ethAmount);

        // Remove the order by replacing it with the last order and popping the array
        orders[orderIndex] = orders[orders.length - 1];
        orders.pop();
    }

    function getOrders() public view returns (Order[] memory) {
        return orders;
    }

    function getOrderDetails(uint256 orderIndex) public view returns (address user, uint256 ethAmount, uint256 usdcAmount) {
        require(orderIndex < orders.length, "Order index out of range");
        Order storage order = orders[orderIndex];
        return (order.user, order.ethAmount, order.usdcAmount);
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
