// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PaymentGateway {
    event PaymentInitiated(address indexed buyer, string paymentRef, uint256 amount);
    event PaymentConfirmed(address indexed buyer, string paymentRef, uint256 time);

    mapping(string => bool) public paymentStatus;

    function initiatePayment(string memory _paymentRef, uint256 _amount) public {
        emit PaymentInitiated(msg.sender, _paymentRef, _amount);
    }

    function confirmPayment(string memory _paymentRef) public {
        paymentStatus[_paymentRef] = true;
        emit PaymentConfirmed(msg.sender, _paymentRef, block.timestamp);
    }

    function isPaymentComplete(string memory _paymentRef) public view returns (bool) {
        return paymentStatus[_paymentRef];
    }
}
