const PluangToken = artifacts.require("PluangToken");
const PluangTokenSale = artifacts.require("PluangTokenSale");

module.exports = (deployer) => {
  deployer.deploy(PluangToken, 1000000)
  .then(() => {
    // Token price is 0.001 Ether
    const tokenPrice = 1000000000000000;
    return deployer.deploy(PluangTokenSale, PluangToken.address, tokenPrice);
  });
};