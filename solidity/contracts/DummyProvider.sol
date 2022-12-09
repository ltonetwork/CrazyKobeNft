// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@proofi/contracts/contracts/IProvider.sol";


contract DummyProvider is IProvider {

  function url() external view returns (string memory) {
    return "https://example.com";
  }

  function isKnown(address _wallet) external view returns (bool) {
    return true;
  }


}
