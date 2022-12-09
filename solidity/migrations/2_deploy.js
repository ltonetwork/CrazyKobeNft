const NFT = artifacts.require("./NFT.sol");
const allConfigs = require("../config.json");

module.exports = async function(deployer, network) {
    const config = allConfigs[network.replace(/-fork$/, '')] || allConfigs.default;

    await deployer.deploy(NFT, config.name, config.symbol);
};
