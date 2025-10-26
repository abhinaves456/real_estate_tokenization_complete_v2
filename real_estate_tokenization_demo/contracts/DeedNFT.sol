// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeedNFT is ERC721, Ownable {
    uint256 public tokenCounter;

    mapping(uint256 => string) private _tokenURIs;

    event DeedMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("DeedNFT", "DEED") {
        tokenCounter = 0;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function mintDeed(address to, string memory uri) external onlyOwner returns (uint256) {
        tokenCounter += 1;
        uint256 newId = tokenCounter;
        _mint(to, newId);
        _setTokenURI(newId, uri);
        emit DeedMinted(to, newId, uri);
        return newId;
    }
}
