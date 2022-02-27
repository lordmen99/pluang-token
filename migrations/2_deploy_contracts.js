const PluangToken = artifacts.require("PluangToken");

module.exports = function (deployer) {
  deployer.deploy(PluangToken, 1000000);
};