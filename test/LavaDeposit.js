
var LavaTestUtils = require("./LavaTestUtils");

var ethSigUtil = require('eth-sig-util')

var _0xBitcoinToken = artifacts.require("./_0xBitcoinToken.sol");

var LavaWallet = artifacts.require("./LavaWallet.sol");
var LavaDeposit = artifacts.require("./LavaDeposit.sol");


const ethAbi = require('ethereumjs-abi')
var ethUtil =  require('ethereumjs-util');
var web3utils =  require('web3-utils');

const Tx = require('ethereumjs-tx')
var lavaTestUtils = new LavaTestUtils();

const Web3 = require('web3')
// Instantiate new web3 object pointing toward an Ethereum node.
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

var lavaSignature;

//https://web3js.readthedocs.io/en/1.0/web3-utils.html
//https://medium.com/@valkn0t/3-things-i-learned-this-week-using-solidity-truffle-and-web3-a911c3adc730


var test_account= {
    'address': '0x617092b228a2c112fec772183c185728a4827b67',
    'privateKey': 'f0797d23c3890c0d94d8129de43fc57e3217cb16690fc7001e91bd35076c69af'
}

contract('LavaWallet', function(accounts) {

  var walletContract;
  var lavaDepositContract;
  var tokenContract;



    it("can deploy ", async function () {

      console.log( 'deploying wallet' )
        walletContract = await LavaWallet.deployed();

        lavaDepositContract = await LavaDeposit.deployed();

  }),



    it("find schemahash", async function () {


      var  hardcodedSchemaHash = '0x8fd4f9177556bbc74d0710c8bdda543afd18cc84d92d64b5620d5f1881dceb37' ;

      var  typedParams =  [
        {
          type: 'bytes',
          name: 'method',
          value: 0
        },
         {
           type: 'address',
           name: 'from',
           value: 0
         },
         {
           type: 'address',
           name: 'to',
           value: 0
         },
         {
           type: 'address',
           name: 'walletAddress',
           value: 0
         },
         {
           type: 'address',
           name: 'tokenAddress',
           value: 0
         },
         {
           type: 'uint256',
           name: 'tokenAmount',
           value: 0
         },
         {
           type: 'uint256',
           name: 'relayerReward',
           value: 0
         },
         {
           type: 'uint256',
           name: 'expires',
           value: 0
         },
         {
           type: 'uint256',
           name: 'nonce',
           value: 0
         }
       ]




        const error = new Error('Expect argument to be non-empty array')
        if (typeof typedParams !== 'object' || !typedParams.length) throw error

        const data = typedParams.map(function (e) {
          return e.type === 'bytes' ? ethUtil.toBuffer(e.value) : e.value
        })
        const types = typedParams.map(function (e) { return e.type })
        const schema = typedParams.map(function (e) {
          if (!e.name) throw error
          return e.type + ' ' + e.name
        })



      console.log('schema',new Array(typedParams.length).fill('string'),schema)
        console.log('schema subhash',ethAbi.soliditySHA3(new Array(typedParams.length).fill('string'), schema).toString('hex'))

        console.log('types',types, data)
        console.log('types subhash',ethAbi.soliditySHA3(types, data).toString('hex'))


        var hash = '0x'+ethAbi.soliditySHA3(new Array(typedParams.length).fill('string'), schema).toString('hex') ;

        console.log("hash1", ethAbi.soliditySHA3(
          ['bytes32', 'bytes32'],
          [
            ethAbi.soliditySHA3(new Array(typedParams.length).fill('string'), schema),
            ethAbi.soliditySHA3(types, data)
          ]
        ))

        //need to hardcode the 0x64fcd ... into solidity !!
        console.log("hash2", ethAbi.soliditySHA3(
          ['bytes32', 'bytes32'],
          [
            '0x313236b6cd8d12125421e44528d8f5ba070a781aeac3e5ae45e314b818734ec3',
            ethAbi.soliditySHA3(types, data)
          ]
        ))


        /*return ethAbi.soliditySHA3(
          ['bytes32', 'bytes32'],
          [
            ethAbi.soliditySHA3(new Array(typedParams.length).fill('string'), schema),
            ethAbi.soliditySHA3(types, data)
          ]
        )*/




        assert.equal(hash,hardcodedSchemaHash )
    });


  it("can mint tokens", async function () {


   tokenContract = await _0xBitcoinToken.deployed();


    await printBalance(test_account.address,tokenContract)

//canoe

//7.3426930413956622283065143620738574142638959639431768834166324387693517887725e+76)


    console.log('contract')

    console.log(tokenContract.address)


    var challenge_number = await tokenContract.getChallengeNumber.call( );



  //  challenge_number = '0x085078f6e3066836445e800334b4186d99567065512edfe78fa7a4f611d51c3d'

  //   var solution_number = 1185888746
  //  var solution_digest = '0x000016d56489592359ce8e8b61ec335aeb7b7dd5695da22e25ab2039e02c8976'

  //  var sress = '0x2B63dB710e35b0C4261b1Aa4fAe441276bfeb971';



    var targetString = await tokenContract.getMiningTarget.call({from: addressFrom});
    var miningTarget = web3utils.toBN(targetString);

    console.log('target',miningTarget)
      console.log('challenge',challenge_number)

    var addressFrom = test_account.address;

    console.log("starting to mine...")

    var solution_number;
    var phraseDigest;

  while(true)
  {
      solution_number = web3utils.randomHex(32)
      phraseDigest = web3utils.soliditySha3(challenge_number, addressFrom, solution_number )

    var digestBytes32 = web3utils.hexToBytes(phraseDigest)
    var digestBigNumber = web3utils.toBN(phraseDigest)


    if ( digestBigNumber.lt(miningTarget)   )
    {
      console.log("found a good solution nonce!", solution_number);

      break;
    }
  }

  console.log('phraseDigest', phraseDigest);  // 0x0007e4c9ad0890ee34f6d98852d24ce6e9cc6ecfad8f2bd39b7c87b05e8e050b

  console.log(solution_number)


  var checkDigest = await tokenContract.getMintDigest.call(solution_number,phraseDigest,challenge_number, {from: addressFrom});

  console.log('checkDigest',checkDigest)

  console.log('target',miningTarget)

  console.log('challenge_number',challenge_number)

  //var checkSuccess = await tokenContract.checkMintSolution.call(solution_number,phraseDigest,challenge_number, target );
  //  console.log('checkSuccess',checkSuccess)

//  var mint_tokens = await tokenContract.mint.call(solution_number,phraseDigest, {from: from_address});
  await submitMintingSolution(tokenContract, solution_number,phraseDigest,test_account);
  // console.log("token mint: " + mint_tokens);


  await printBalance(test_account.address,tokenContract)

  assert.equal(checkDigest, phraseDigest ); //initialized

});


it("can deposit 0xbtc into lava wallet", async function () {


    await printBalance(test_account.address,tokenContract)


      ///CHANGE ME

    var _0xBitcoinABI = require('../javascript/abi/_0xBitcoinToken.json');
    var LavaWalletABI = require('../javascript/abi/LavaWallet.json');
    var LavaDepositABI = require('../javascript/abi/LavaDeposit.json');




      var addressFrom = test_account.address;

      var tokenRecipient = "0xa7e164d80c874758421102f7be00880739c1d9bc";

      var depositAmount = 5000000;


      var remoteCallData = tokenRecipient;   


      console.log('remoteCallData',remoteCallData)

      var txData = web3.eth.abi.encodeFunctionCall({
              name: 'approveAndCall',
              type: 'function',
              inputs: [
                {
                  "name": "spender",
                  "type": "address"
                },
                {
                  "name": "tokens",
                  "type": "uint256"
                },
                {
                  "name": "data",
                  "type": "bytes"
                }],
                outputs: [
                  {
                    "name": "success",
                    "type": "bool"
                  }
              ]
          }, [lavaDepositContract.address, depositAmount, remoteCallData]);


          try{
            var txCount = await web3.eth.getTransactionCount(addressFrom);
            console.log('txCount',txCount)
           } catch(error) {  //here goes if someAsyncPromise() rejected}
            console.log(error);

             return error;    //this will result in a resolved promise.
           }

           var addressTo = tokenContract.address;
           var privateKey = test_account.privateKey;

          const txOptions = {
            nonce: web3utils.toHex(txCount),
            gas: web3utils.toHex("1704624"),
            gasPrice: web3utils.toHex(web3utils.toWei("4", 'gwei') ),
            value: 0,
            to: addressTo,
            from: addressFrom,
            data: txData
          }



        var sentDeposit = await new Promise(function (result,error) {

              sendSignedRawTransaction(web3,txOptions,addressFrom,privateKey, function(err, res) {
              if (err) error(err)
                result(res)
            })

          }.bind(this));


           console.log(sentDeposit)

            var checkDeposit  = await walletContract.balanceOf.call(tokenContract.address,tokenRecipient, {from: addressFrom});

            var accountBalance = await getBalance(walletContract.address,tokenContract)

            //get lava balance

            assert.equal(accountBalance.token, 5000000 );

            assert.equal(checkDeposit.toNumber(), 5000000 );


            //not working
            console.log('checkDeposit ',checkDeposit.toNumber())

            await printBalance(test_account.address,tokenContract)


            console.log(walletContract.address)
            await printBalance(walletContract.address,tokenContract)

});







});



async function getBalance (account ,tokenContract)
{
      var balance_eth = await (web3.eth.getBalance(account ));
     var balance_token = await tokenContract.balanceOf.call(account , {from: account });

     return {ether: web3utils.fromWei(balance_eth.toString(), 'ether'), token: balance_token.toNumber() };

 }

 async function printBalance (account ,tokenContract)
 {
       var balance_eth = await (web3.eth.getBalance(account ));
      var balance_token = await tokenContract.balanceOf.call(account , {from: account });

      console.log('acct balance', account, web3utils.fromWei(balance_eth.toString() , 'ether')  , balance_token.toNumber())

  }


 async function submitMintingSolution(tokenContract, nonce,digest, account)
 {

//   console.log('tokenContract',tokenContract);



   var addressTo =  tokenContract.address;
   var addressFrom = account.address;


  try{
    var txCount = await  web3.eth.getTransactionCount(addressFrom);
    console.log('txCount',txCount)
   } catch(error) {  //here goes if someAsyncPromise() rejected}
    console.log(error);
      this.miningLogger.appendToErrorLog(error)
     return error;    //this will result in a resolved promise.
   }




    var txData =  web3.eth.abi.encodeFunctionCall({
            name: 'mint',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: 'nonce'
            },{
                type: 'bytes32',
                name: 'challenge_digest'
            }]
        }, [nonce, digest]);



    var max_gas_cost = 1704624;

  //  var mintMethod =  tokenContract.mint(nonce,digest);

  //  var estimatedGasCost = await mintMethod.estimateGas({gas: max_gas_cost, from:addressFrom, to: addressTo });

  console.log(tokenContract);

  var estimatedGasCost = 1704623

    console.log('estimatedGasCost',estimatedGasCost);
    console.log('txData',txData);

    console.log('addressFrom',addressFrom);
    console.log('addressTo',addressTo);



    if( estimatedGasCost > max_gas_cost){
      console.log("Gas estimate too high!  Something went wrong ")
      return;
    }


    const txOptions = {
      nonce: web3utils.toHex(txCount),
      gas: web3utils.toHex(estimatedGasCost),   //?
      gasPrice: web3utils.toHex(3),
      value: 0,
      to: addressTo,
      from: addressFrom,
      data: txData
    }



  return new Promise(function (result,error) {

       sendSignedRawTransaction( web3,txOptions,addressFrom,account.privateKey, function(err, res) {
        if (err) error(err)
          result(res)
      })

    }.bind(this));


 }

 async function sendSignedRawTransaction(web3,txOptions,addressFrom,fullPrivKey,callback) {


   var privKey = truncate0xFromString( fullPrivKey )

   const privateKey = new Buffer( privKey, 'hex')
   const transaction = new Tx(txOptions)


   transaction.sign(privateKey)


   const serializedTx = transaction.serialize().toString('hex')

     try
     {
       var result =  web3.eth.sendSignedTransaction('0x' + serializedTx, callback)
     }catch(e)
     {
       console.log(e);
     }
 }


  function truncate0xFromString(s)
 {

   if(s.startsWith('0x')){
     return s.substring(2);
   }
   return s;
 }
