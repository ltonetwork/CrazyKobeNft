const NFT = artifacts.require("./NFT.sol");
const allConfigs = require("../config.json");
const Web3 = require("web3");
const linkABI = require("../abi/link.abi");

module.exports = async function(deployer, network) {
  const config = {...allConfigs.default, ...(allConfigs[network.replace(/-fork$/, '')] || {})};

  if (!config.verification) return;

  const nft = await NFT.deployed();
  const linkToken = new web3.eth.Contract(linkABI, config.verification.token);
  const ownerAddress = await nft.owner();

  await linkToken.methods.transfer(nft.address, Web3.utils.toBN(config.verification.fee).muln(10))
    .send({from: ownerAddress});
};
