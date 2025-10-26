// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LegalCompliance {
    struct PropertyLegalInfo {
        string propertyId;
        string reraId;
        string state;
        string documentHash;
        bool verifiedByAuthority;
        uint256 lastUpdated;
    }

    mapping(string => PropertyLegalInfo) public propertyRecords;
    address public admin;

    event PropertyRegistered(string propertyId, string reraId, string state, string documentHash);
    event PropertyVerified(string propertyId, string verifier, uint256 time);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    function registerProperty(
        string memory _propertyId,
        string memory _reraId,
        string memory _state,
        string memory _documentHash
    ) public onlyAdmin {
        propertyRecords[_propertyId] = PropertyLegalInfo({
            propertyId: _propertyId,
            reraId: _reraId,
            state: _state,
            documentHash: _documentHash,
            verifiedByAuthority: false,
            lastUpdated: block.timestamp
        });
        emit PropertyRegistered(_propertyId, _reraId, _state, _documentHash);
    }

    function markAsVerified(string memory _propertyId) public onlyAdmin {
        propertyRecords[_propertyId].verifiedByAuthority = true;
        propertyRecords[_propertyId].lastUpdated = block.timestamp;
        emit PropertyVerified(_propertyId, "Registered Authority", block.timestamp);
    }

    function getPropertyLegalInfo(string memory _propertyId)
        public
        view
        returns (PropertyLegalInfo memory)
    {
        return propertyRecords[_propertyId];
    }
}
