const NFT = artifacts.require("./NFT.sol");
const allConfigs = require("../config.json");

module.exports = async function(deployer, network) {
    const config = {...allConfigs.default, ...(allConfigs[network.replace(/-fork$/, '')] || {})};
    await deployer.deploy(NFT, config.name, config.symbol, config.maxTokens, config.maxPerWallet, config.price);

    if (config.baseURI) {
        const nft = await NFT.deployed();
        await nft.setBaseURI(config.baseURI);
    }
};
