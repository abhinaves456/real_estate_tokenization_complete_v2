// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract KYCVerification {
    struct KYCRecord {
        string userIdHash;
        string documentHash;
        bool verified;
        uint256 timestamp;
    }

    mapping(address => KYCRecord) public kycData;
    address public admin;

    event KYCSubmitted(address indexed user, string userIdHash, string documentHash);
    event KYCVerified(address indexed user, uint256 time);

    constructor() {
        admin = msg.sender;
    }

    function submitKYC(string memory _userIdHash, string memory _documentHash) public {
        kycData[msg.sender] = KYCRecord({
            userIdHash: _userIdHash,
            documentHash: _documentHash,
            verified: false,
            timestamp: block.timestamp
        });
        emit KYCSubmitted(msg.sender, _userIdHash, _documentHash);
    }

    function verifyKYC(address _user) public {
        require(msg.sender == admin, "Only admin can verify in demo");
        kycData[_user].verified = true;
        emit KYCVerified(_user, block.timestamp);
    }

    function isVerified(address _user) public view returns (bool) {
        return kycData[_user].verified;
    }
}
