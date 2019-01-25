// const SplitPayment = artifacts.require("./SplitPayment.sol");

// contract("SplitPayment", accounts => {

//   let splitPayment;
//   let owner =  accounts[0];
//   let artist = accounts[1];
//   let fan1 = accounts[2];
//   let fan2 = accounts[3];
//   let streamingService = accounts[4];
//   let expectedContractBalance = 4000000000000000000;
//   let catchRevert = require("./exceptions.js").catchRevert;

  
//   beforeEach( async () => {
//     splitPayment = await SplitPayment.deployed();
//   });
 
//   it('should be initialized', async () => {
//     let currentStage = await splitPayment.stage();
//     assert.equal(currentStage, 0, 'Stage is not Creation.');
//   });

//   it('owner should be able to kill contract in Creation stage', async () => {
//     splitPaymentNew = await SplitPayment.new();

//     await splitPaymentNew.kill();
//     let bc = await web3.eth.getCode(splitPaymentNew.address);
//     console.log(bc);
//     assert.equal(bc, '0x', 'Hi hi baddest bytecode in town is still here. ')
//   });

//   it('other people than owner should not be able to kill contract in Creation stage', async () => {
//     catchRevert(splitPayment.kill({from: fan1}));
//   });

//   it('owner should not be able to kill contract in Open stage', async () => {
//     await splitPayment.openSplit();
//     //let currentStage = await splitPayment.stage();
//     //console.log(currentStage); 
//     catchRevert(splitPayment.kill());
//    });
// });
