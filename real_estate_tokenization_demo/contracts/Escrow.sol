// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Escrow is Ownable {
    address public arbiter;
    address public payer;
    address public payee;
    uint256 public amount;

    constructor(address _arbiter) Ownable(msg.sender) {
        arbiter = _arbiter;
    }

    function deposit(address _payee) external payable {
        require(msg.value > 0, "Must deposit some Ether");
        payer = msg.sender;
        payee = _payee;
        amount = msg.value;
    }

    function release() external {
        require(msg.sender == arbiter, "Only arbiter can release funds");
        require(amount > 0, "No funds to release");
        payable(payee).transfer(amount);
        amount = 0;
    }

    function refund() external {
        require(msg.sender == arbiter, "Only arbiter can refund");
        require(amount > 0, "No funds to refund");
        payable(payer).transfer(amount);
        amount = 0;
    }
}
