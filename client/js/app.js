App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: () => {
    console.log("App initialised....");
    return App.initWeb3();
  },

  initWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: () => {
    $.getJSON("PluangTokenSale.json", (pluangTokenSale) => {
      App.contracts.PluangTokenSale = TruffleContract(pluangTokenSale);
      App.contracts.PluangTokenSale.setProvider(App.web3Provider);
      App.contracts.PluangTokenSale.deployed().then((pluangTokenSale) =>{
        console.log("Pluang Token Sale Address: ", pluangTokenSale.address);
      })
    })
    .then(() => {
      $.getJSON("PluangToken.json", (pluangToken) => {
        App.contracts.PluangToken = TruffleContract(pluangToken);
        App.contracts.PluangToken.setProvider(App.web3Provider);
        App.contracts.PluangToken.deployed().then((pluangToken) =>{
          console.log("Pluang Token Address: ", pluangToken.address);
        })
        App.listenForEvents();
        return App.render();
      })
    })
  },
  
  // Listen for events emitted from the contract
  listenForEvents: () => {
    App.contracts.PluangTokenSale.deployed().then((instance) => {
      instance.contract.events.Sell( {
        fromBlock: 0,
        toBlock: 'latest',
      })
      .on('data', function(event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: async () => {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    account = await web3.eth.getAccounts();
    App.account = account[0];
    $('#accountAddress').html("Your Account: " + App.account);

    App.contracts.PluangTokenSale.deployed().then((instance) => {
      pluangTokenSaleInstance = instance;
      return pluangTokenSaleInstance.tokenPrice();
    }).then((tokenPrice) => {
      App.tokenPrice = tokenPrice.toNumber();
      return web3.utils.fromWei(tokenPrice, "ether");
    }).then((priceInEther) => {
      $('.token-price').html(priceInEther);
      return pluangTokenSaleInstance.tokensSold();
    }).then((tokensSold) => {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.PluangToken.deployed().then((instance) => {
        pluangTokenInstance = instance;
        return pluangTokenInstance.balanceOf(App.account);
      }).then((balance) => {
        //console.log(balance.toNumber());
        $('.plg-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: (e) => {
    e.preventDefault();
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    console.log(numberOfTokens);
    App.contracts.PluangTokenSale.deployed().then((instance) => {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then((result) => {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
      
    });
  }
}

$(() => {
  $(window).load(() => {
    App.init();
  })
});