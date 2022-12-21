const NFT = artifacts.require("./NFT.sol");
const allConfigs = require("../config.json");
const Web3 = require("web3");

module.exports = async function(deployer, network) {
  const config = {...allConfigs.default, ...(allConfigs[network.replace(/-fork$/, '')] || {})};
  if (!config.verification) return;

  const nft = await NFT.deployed();
  await nft.setupVerification(
    config.verification.identityProvider,
    config.verification.token,
    config.verification.oracle,
    config.verification.jobId,
    Web3.utils.toBN(config.verification.fee),
  );

};
