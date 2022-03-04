# pluang-token
ERC20 Token of Pluang on Local Blockchain.


# Requirements

1. Ganache : Download Ganache and run on your local machine, it will create local blockchain and provides 10 fake accounts with 100 fake ethers in each.

2. Truffle : Install truffle globally by- "npm install -g truffle". It is a framework for developing, testing and deploying our smart contracts.

3. Metamask : Add MetaMask extension to your browser. It is a software cryptocurrency wallet used to interact with the Ethereum blockchain.
             
             
# How to run on your local machine

1. Clone the repository.
2. Install all dependencies
   -> npm install
3. Start Ganache.
4. On terminal:
     # Deploy smart contracts on blockchain
     -> truffle migrate
     # Start truffle dev environment
     -> truffle console
     # Grab PluangTokenSale instance 
     -> PluangTokenSale.deployed().then((instance) => { tokenSale = instance; })
     # Grab PluangToken instance 
     -> PluangToken.deployed().then((instance) => { token = instance; })
     # Accessing accounts
     -> web3.eth.getAccounts().then((accounts) => { admin = accounts[0]; })
     # Provisioning 75% of total tokens for sale
     -> token.transfer(tokenSale.address, 750000, {from: admin})
5. Start the server
   -> npm run dev
6. Adding local network to the metamask
   -> Go to Add Network
   -> Network Name: Ganache
   -> New RPC URL: HTTP://127.0.0.1:7545
   -> Chain ID: 1337
   -> Click save
7. Import the accounts provided by Ganache to MetaMask.
   -> Go to Import Account
   -> Paste the private key and save
8. Connect the accounts to your website
   -> There is connected sites option under the three dots next to the account name.
9. Refresh the website
10. Now you can buy Pluang Tokens.
