const PluangToken = artifacts.require("PluangToken");
contract("PluangToken", (accounts) => {

  it('initializes the contract with the correct values', async () => {
    const token = await PluangToken.deployed()
    const name = await token.name();
    assert.equal(name, 'Pluang Token', 'has the correct name');
    const symbol = await token.symbol();
    assert.equal(symbol, 'PLG', 'has the correct symbol');
    const standard = await token.standard();
    assert.equal(standard, 'Pluang Token v1.0', 'has the correct standard');
  })

  it('allocates the initial supply upon deployment', async () => {
    const token = await PluangToken.deployed();
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
    const adminBalance = await token.balanceOf(accounts[0]);
    assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account');
  });

  // testing transfer functions
  it('transfers token ownership', async () => {
    const token = await PluangToken.deployed();
    try {
        // Test `require` statement first by transferring something larger than the sender's balance
        await token.transfer.call(accounts[1], 10000000);
    } catch (error) {
        assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
    }
    const success = await token.transfer.call(accounts[1], 250000, { from: accounts[0] });
    assert.equal(success, true, 'it returns true');
    const receipt = await token.transfer(accounts[1], 250000, { from: accounts[0] });
    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
    assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
    assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
    assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.toNumber(), 250000, 'adds the amount to the receiving account');
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 750000, 'deducts the amount from the sending account');
  });

  // testing approve function
  it('approves tokens for delegated transfer', async () => {
    const token = await PluangToken.deployed();
    const success= await token.approve.call(accounts[1], 100);
    assert.equal(success, true, 'it returns true');
    const receipt = await token.approve(accounts[1], 100, { from: accounts[0] });
    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
    assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
    assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
    assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
    const allowance = await token.allowance(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated trasnfer');
  });

  // testing tranferfrom function 
  it('handles delegated token transfers', async () => {
    const token = await PluangToken.deployed();
    fromAccount = accounts[2];
    toAccount = accounts[3];
    spendingAccount = accounts[4];
    // Transfer some tokens to fromAccount
    await token.transfer(fromAccount, 100, { from: accounts[0] });
    // Approve spendingAccount to spend 10 tokens form fromAccount
    await token.approve(spendingAccount, 10, { from: fromAccount });
    try {
        // Try transferring something larger than the sender's balance
        await token.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
    } catch (error) {
        assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
    }
    try {
        // Try transferring something larger than the approved amount
        await token.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
    } catch (error) {
        assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
    }
    const success = await token.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
    assert.equal(success, true);
    const receipt = await token.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
    assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
    assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
    assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
    const balancefrom = await token.balanceOf(fromAccount);
    assert.equal(balancefrom.toNumber(), 90, 'deducts the amount from the sending account');
    const balanceto = await token.balanceOf(toAccount);
    assert.equal(balanceto.toNumber(), 10, 'adds the amount from the receiving account');
    const allowance = await token.allowance(fromAccount, spendingAccount);
    assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
  });
});
