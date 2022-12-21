// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@proofi/solidity/contracts/IProvider.sol";


contract DummyProvider is IProvider {
  mapping(address => bool) known;

  constructor(address[] memory _wallets) {
    for (uint256 i = 0; i < _wallets.length; i++) {
      known[_wallets[i]] = true;
    }
  }

  function url() external view returns (string memory) {
    return "https://example.com";
  }

  function isKnown(address _wallet) external view returns (bool) {
    return known[_wallet];
  }


}
