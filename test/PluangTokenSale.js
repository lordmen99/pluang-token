const PluangTokenSale = artifacts.require("PluangTokenSale");
const PluangToken = artifacts.require("PluangToken");

contract('PluangTokenSale', (accounts) => {
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000; // in wei
    var tokensAvailable = 750000;
    var numberOfTokens;

    it('initializes the contract with the correct values', async () => {
        const tokenSaleInstance = await PluangTokenSale.deployed();
        const contractAddress = await tokenSaleInstance.address;
        assert.notEqual(contractAddress, 0x0, 'has contract address');
        const tokenContractAddress = await tokenSaleInstance.tokenContract();
        assert.notEqual(tokenContractAddress, 0x0, 'has token contract address');
        const price = await tokenSaleInstance.tokenPrice();
        assert.equal(price, tokenPrice, 'token price is correct');
    });

    it('facilitates token buying', async () => {
        const tokenInstance = await PluangToken.deployed();
        const tokenSaleInstance = await PluangTokenSale.deployed();
        // Provision 75% of all tokens to the token sale
        await tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
        numberOfTokens = 1000;
        const receipt = await tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
        assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
        assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
        const amount = await tokenSaleInstance.tokensSold();
        assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
        const balanceBuyer = await tokenInstance.balanceOf(buyer);
        assert.equal(balanceBuyer.toNumber(), numberOfTokens);
        const balance = await tokenInstance.balanceOf(tokenSaleInstance.address);
        assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
        try {
            // Try to buy tokens different from the ether value
            await tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
        }
        try {
            await tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
        }
    });
    
    it('ends token sale', async () => {
        const tokenInstance = await PluangToken.deployed();
        const tokenSaleInstance = await PluangTokenSale.deployed();
        try {
            // Try to end sale from account other than the admin
            await tokenSaleInstance.endSale({ from: buyer });
        } catch (error) {
            assert(error.message.indexOf('revert' >= 0, 'must be admin to end sale'));
        }
        // End sale as admin
        const receipt = await tokenSaleInstance.endSale({ from: admin });
        const balanceAdmin = await tokenInstance.balanceOf(admin);
        assert.equal(balanceAdmin.toNumber(), 999000, 'returns all unsold dapp tokens to admin');
        // Check that the contract has no balance
        const balance = await web3.eth.getBalance(tokenSaleInstance.address);
        assert.equal(balance, 0);
    });
});