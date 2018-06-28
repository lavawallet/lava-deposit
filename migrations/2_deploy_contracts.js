var _0xBitcoinToken = artifacts.require("./_0xBitcoinToken.sol");


var ECRecovery = artifacts.require("./ECRecovery.sol");

var LavaWallet = artifacts.require("./LavaWallet.sol");

var LavaDeposit = artifacts.require("./LavaDeposit.sol");

module.exports =   function(deployer) {


    deployer.deploy(_0xBitcoinToken);




    deployer.deploy(ECRecovery);

    deployer.link(ECRecovery, LavaWallet)

    deployer.deploy(LavaWallet)

      // Option 2) Console log the address:
      .then(() => console.log(LavaWallet.address))

      // Option 3) Retrieve the contract instance and get the address from that:
      .then(() => LavaWallet.deployed())
      .then(_instance => deployer.deploy(LavaDeposit,_instance.address));



};
