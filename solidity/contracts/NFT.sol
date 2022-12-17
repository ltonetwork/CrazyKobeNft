// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@proofi/contracts/contracts/Verification.sol";

// This demo is an NFT that can only be minted by verified wallets.
// Minted NFTs are initially reserved and unreserved on verification.
contract NFT is ERC721, Ownable, Verification {
    string private baseURI;

    // Number of available tokens
    uint256 public maxTokens;

    // Maximum NFTs a wallet is allowed to mint (set to -1 to disable)
    uint256 public maxPerWallet;

    // Mint price in wei
    uint256 public price;

    // Emitted when `tokenId` token is reserved for `wallet` during mint
    event Reserve(address indexed wallet, uint256 indexed tokenId);

    constructor(
      string memory _name,
      string memory _symbol,
      uint256 _maxTokens,
      uint256 _maxPerWallet,
      uint256 _price
    ) ERC721(_name, _symbol) {
      maxTokens = _maxTokens;
      maxPerWallet = _maxPerWallet;
      price = _price;
    }

    mapping(address => uint256) private mintedPerWallet;
    mapping(uint256 => address) private reserved;
    mapping(address => uint256[]) private reservedForOwner;

    // When a token is minted verify it using the IdentityProvider.
    // The token is reserved until verification is complete.
    function mint(uint256 id) public payable {
        require(id > 0 && id <= maxTokens && isAvailable(id), "token unavailable");
        require(_allowedToMint(msg.sender) > 0, "mint limit reached for this wallet");
        require(!isDeclined(msg.sender), "wallet is declined");
        require(msg.value >= price, "insufficient payment");

        if (isApproved(msg.sender)) {
            _safeMint(msg.sender, id);
        } else {
            verify(msg.sender);
            _reserve(msg.sender, id);
        }
    }

    // Count the number of minted tokens per wallet, so we can limit
    function _afterTokenTransfer(
      address from,
      address to,
      uint256 firstTokenId,
      uint256 batchSize
    ) override internal virtual {
        if (from == address(0)) {
            mintedPerWallet[to] += 1;
        }
    }

    // The number of tokens the wallet is allowed to mint
    function _allowedToMint(address owner) internal returns(uint256) {
        return maxPerWallet - mintedPerWallet[msg.sender] - reservedForOwner[msg.sender].length;
    }

    // Lock a token. reserved tokens can't be transferred.
    function _reserve(address owner, uint256 id) internal {
        reserved[id] = owner;
        reservedForOwner[owner].push(id);

        emit Reserve(owner, id);
    }

    function isAvailable(uint256 id) public view returns (bool) {
        return id > 0 && id <= maxTokens && !_exists(id) && reserved[id] == address(0);
    }

    function reservedFor(uint256 id) external view returns (address) {
        return reserved[id];
    }

    // Cancel a reservation that would otherwise be stuck
    function cancelReservation(uint256 id) public {
        address owner = reserved[id];
        delete reserved[id];

        if (reservedForOwner[owner].length == 1) {
            if (reservedForOwner[owner][0] == id) {
                delete reservedForOwner[owner];
            }
        } else {
            for (uint256 i = 0; i < reservedForOwner[owner].length; i++){
                if (reservedForOwner[owner][i] == id) {
                    reservedForOwner[owner][i] = reservedForOwner[owner][reservedForOwner[owner].length - 1];
                    reservedForOwner[owner].pop();
                    break;
                }
            }
        }
    }

    // Hook from approved verification: unlock the tokens
    function onApproved(address owner) internal override {
        for (uint256 i = 0; i < reservedForOwner[owner].length; i++) {
            uint256 id = reservedForOwner[owner][i];
            delete reserved[id];
            _safeMint(owner, id);
        }

        delete reservedForOwner[owner];
    }

    // Hook from denied verification
    function onDenied(address owner) internal override {
        for (uint256 i = 0; i < reservedForOwner[owner].length; i++) {
            uint256 id = reservedForOwner[owner][i];
            delete reserved[id];
        }
        delete reservedForOwner[owner];
    }

    // Set the location for the NFT meta data
    function setBaseURI(string calldata _uri) public onlyOwner {
        baseURI = _uri;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // Change the price for minting an NFT
    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }
}
