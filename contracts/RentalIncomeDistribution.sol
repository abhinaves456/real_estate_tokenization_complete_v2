// contracts/RentalIncomeDistribution.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RentalIncomeDistribution is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public fractionalToken; // ERC20 representing fractional ownership
    IERC20 public stablecoin; // ERC20 used for rent payments (mock stablecoin)
    address public taxReceiver;
    uint256 public constant TDS_BP = 1000; // 10% in basis points (1000/10000)

    event RentDeposited(address indexed from, uint256 amount);
    event RentDistributed(uint256 totalAmount, uint256 tdsAmount, uint256 distributedAmount);
    event TaxReceiverUpdated(address indexed newReceiver);

    constructor(address _fractionalToken, address _stablecoin) {
        require(_fractionalToken != address(0), "Invalid fractional token");
        require(_stablecoin != address(0), "Invalid stablecoin");
        fractionalToken = IERC20(_fractionalToken);
        stablecoin = IERC20(_stablecoin);
        taxReceiver = msg.sender;
    }

    // Owner can set tax receiver (e.g., platform or government remit)
    function setTaxReceiver(address _receiver) external onlyOwner {
        require(_receiver != address(0), "Invalid address");
        taxReceiver = _receiver;
        emit TaxReceiverUpdated(_receiver);
    }

    // Deposit stablecoin to contract (caller must approve first)
    function depositRent(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        emit RentDeposited(msg.sender, amount);
    }

    // Distribute a specified amount that is present in contract balance to owners provided in holders[]
    // For demo, caller must provide full list of holders to distribute to
    function distributeToHolders(uint256 amount, address[] calldata holders) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        uint256 contractBalance = stablecoin.balanceOf(address(this));
        require(contractBalance >= amount, "Insufficient contract balance");

        uint256 totalSupply = fractionalToken.totalSupply();
        require(totalSupply > 0, "No fractional tokens minted");

        // Calculate TDS
        uint256 tdsAmount = (amount * TDS_BP) / 10000; // e.g., 10%
        uint256 distributable = amount - tdsAmount;

        // Transfer TDS to tax receiver
        if (tdsAmount > 0) {
            stablecoin.safeTransfer(taxReceiver, tdsAmount);
        }

        // Distribute pro-rata based on fractionalToken.balanceOf(holder)
        uint256 distributedSum = 0;
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            uint256 holderBalance = fractionalToken.balanceOf(holder);
            if (holderBalance == 0) continue;
            uint256 share = (distributable * holderBalance) / totalSupply;
            if (share > 0) {
                stablecoin.safeTransfer(holder, share);
                distributedSum += share;
            }
        }

        // If rounding left some small remainder, keep as contract balance (owner can handle)
        emit RentDistributed(amount, tdsAmount, distributedSum);
    }

    // Helper: distribute entire contract balance pro-rata using provided holders array
    function distributeAll(address[] calldata holders) external onlyOwner {
        uint256 bal = stablecoin.balanceOf(address(this));
        require(bal > 0, "No funds to distribute");
        distributeToHolders(bal, holders);
    }

    // Emergency withdraw (owner only) to rescue tokens if needed
    function emergencyWithdraw(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        stablecoin.safeTransfer(to, amount);
    }
}
