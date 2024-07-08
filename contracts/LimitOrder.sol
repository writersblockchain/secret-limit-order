// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract LimitOrder {
    address public owner;
    IERC20 public usdcToken;

    // Chainlink Price Feed
    AggregatorV3Interface internal priceFeed;

    struct Order {
        address creator;
        uint256 usdcAmount;
        uint256 minSepoliaAmount;
        bool fulfilled;
    }

    Order[] public orders;

    event OrderPlaced(uint256 orderId, address indexed creator, uint256 usdcAmount, uint256 minSepoliaAmount);
    event OrderFulfilled(uint256 orderId, address indexed fulfiller, uint256 usdcAmount, uint256 sepoliaAmount);

    constructor(address _usdcToken, address _priceFeed) {
        owner = msg.sender;
        usdcToken = IERC20(_usdcToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function placeOrder(uint256 usdcAmount, uint256 minSepoliaAmount) external {
        require(usdcToken.transferFrom(msg.sender, address(this), usdcAmount), "Transfer failed");

        orders.push(Order({
            creator: msg.sender,
            usdcAmount: usdcAmount,
            minSepoliaAmount: minSepoliaAmount,
            fulfilled: false
        }));

        emit OrderPlaced(orders.length - 1, msg.sender, usdcAmount, minSepoliaAmount);

        // Check if the order can be fulfilled immediately
        // checkAndFulfillOrder(orders.length - 1);
    }

    function fulfillOrder(uint256 orderId) external payable {
        Order storage order = orders[orderId];
        require(!order.fulfilled, "Order already fulfilled");
        require(msg.value >= order.minSepoliaAmount, "Insufficient Sepolia amount");

        // Check if the order can be fulfilled based on the current Sepolia price
        uint256 currentPrice = getSepoliaPrice();
        uint256 requiredSepoliaAmount = order.usdcAmount * currentPrice / 1e8; // Adjust based on price feed decimals
        require(requiredSepoliaAmount <= order.minSepoliaAmount, "Current price does not fulfill order requirements");

        order.fulfilled = true;
        usdcToken.transfer(msg.sender, order.usdcAmount);
        payable(order.creator).transfer(msg.value);

        emit OrderFulfilled(orderId, msg.sender, order.usdcAmount, msg.value);
    }

    function checkAndFulfillOrder(uint256 orderId) internal {
        Order storage order = orders[orderId];
        uint256 currentPrice = getSepoliaPrice();
        uint256 requiredSepoliaAmount = order.usdcAmount * currentPrice / 1e8; // Adjust based on price feed decimals

        if (requiredSepoliaAmount <= order.minSepoliaAmount) {
            order.fulfilled = true;
            usdcToken.transfer(order.creator, order.usdcAmount); // Return USDC to the creator
            payable(order.creator).transfer(requiredSepoliaAmount); // Send Sepolia ETH to the creator

            emit OrderFulfilled(orderId, address(this), order.usdcAmount, requiredSepoliaAmount);
        }
    }

    function getOrder(uint256 orderId) external view returns (address, uint256, uint256, bool) {
        Order memory order = orders[orderId];
        return (order.creator, order.usdcAmount, order.minSepoliaAmount, order.fulfilled);
    }

    function getAllOrders() external view returns (Order[] memory) {
        return orders;
    }

    function getUnfulfilledOrders() external view returns (Order[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (!orders[i].fulfilled) {
                count++;
            }
        }

        Order[] memory unfulfilledOrders = new Order[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (!orders[i].fulfilled) {
                unfulfilledOrders[index] = orders[i];
                index++;
            }
        }
        return unfulfilledOrders;
    }

    function getFulfilledOrders() external view returns (Order[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].fulfilled) {
                count++;
            }
        }

        Order[] memory fulfilledOrders = new Order[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].fulfilled) {
                fulfilledOrders[index] = orders[i];
                index++;
            }
        }
        return fulfilledOrders;
    }

    function getOrderCount() external view returns (uint256) {
        return orders.length;
    }

    function getUnfulfilledOrderCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < orders.length; i++) {
            if (!orders[i].fulfilled) {
                count++;
            }
        }
    }

    function getFulfilledOrderCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].fulfilled) {
                count++;
            }
        }
    }

    function getSepoliaPrice() public view returns (uint256) {
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
