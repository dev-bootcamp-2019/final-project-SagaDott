//import getWeb3 from "../client/src/utils/getWeb3";

const SplitRevenue = artifacts.require("./SplitRevenue.sol");

contract("SplitRevenue", accounts => {

  let splitRevenue;
  let owner =  accounts[0];
  let artist = accounts[1];
  let fan1 = accounts[2];
  let fan2 = accounts[3];
  let streamingService = accounts[4];
  let expectedContractBalance = 4000000000000000000;
  let catchRevert = require("./exceptions.js").catchRevert; 

 // enum stages { Creation, Open }



  beforeEach( async () => {
    splitRevenue = await SplitRevenue.deployed();
  });

  it('should be initialized', async () => { //behöver testa detta?
    let currentStage = await splitRevenue.stage();
    assert.equal(currentStage, 0, 'stage is not Cretion.');
  });

  it('owner should be able to add an artist in Creation stage', async () => {
    await splitRevenue.addArtist(artist);
    assert.equal(await splitRevenue.artist(), artist, 'The provided artist address does not match.');
  });

  it('owner should not be able to add an artist if an artist already exists', async () => {
    catchRevert(splitRevenue.addArtist(fan1)); //Assert statement is in exceptions.js
  });

  // Deploying new instance to test a state moving forward without with the full instance. 
  it('owner should not be able to add an artist in Open stage', async () => {
    splitRevenueNew = await SplitRevenue.new({ from: owner });

    await splitRevenueNew.openSplit();
    catchRevert(splitRevenueNew.addArtist(artist, {from: fan2})); //correct way of writing?
  });

  it('not owner should not be able to add an artist', async () => {
    catchRevert(splitRevenue.addArtist(artist, {from: fan2})); //correct way of writing?
  });

  it('owner should be able to add a fan in Creation stage', async () => {
    await splitRevenue.addFan(fan1);
    await splitRevenue.addFan(fan2);

    let res = await splitRevenue.fanExists.call(fan1);
    let res2 = await splitRevenue.fanExists.call(fan2);

    //console.log('result' + res);
    assert.equal(res, true, 'fan1 address does not exist');
    assert.equal(res2, true, 'fan2 address does not exist');
  });

  it('owner should not be able to add a fan that already exists', async () => {
    catchRevert(splitRevenue.addFan(fan1));
  });

  it('owner should not be able to add a fan in Open stage', async () => {
    splitRevenueNew = await SplitRevenue.new();
    await splitRevenueNew.openSplit();
    catchRevert(splitRevenueNew.addFan(fan1));
  });

  it('not owner should not be able to add a fan', async () => {
    catchRevert(splitRevenue.addFan(fan1, {from: fan1}));
  });

  it('owner should be able to change state from Creation to Open', async () => {  
    await splitRevenue.openSplit();
    let res = await splitRevenue.stage()
    assert.equal(res, 1, 'stage is not Open'); //open equals to uint 1. 
  });

  it('not owner should not be able to change state from Creation to Open', async () => {
    catchRevert(splitRevenue.openSplit({from: fan2}));
  });

  it('should be able to receive eth in stage Open', async () => {
    //await web3.eth.sendTransaction({from: streamingService, to: splitPayment.paySplit(), value: 3000000000000000000});
    await splitRevenue.paySplit({from: streamingService, value: expectedContractBalance}); // får 2 från denna
    let balance = await web3.eth.getBalance(splitRevenue.address);
    //console.log('contract balance:' + balance);
    assert.equal(balance, expectedContractBalance, 'Contract did not receive 4 eth');
  });

  it('should not be able to receive eth in stage Creation', async () => {
    splitRevenueNew = await SplitRevenue.new();
    catchRevert(splitRevenueNew.paySplit({from: streamingService, value: expectedContractBalance})); 
  });

  it('fan should be able to withdraw', async () => {
    //let balance = await splitPayment.getBalance.call(fan1);
   // console.log(balance.toNumber());
    //await splitPayment.paySplit({from: streamingService, value: expectedContractBalance}); 
    let gasEstimation = await web3.eth.estimateGas(splitRevenue.paySplit({from: streamingService, value: expectedContractBalance}));
    //console.log('gas: ' + gasEstimation);
    let balance1 = await web3.eth.getBalance(fan1);
    //console.log('balance1: ' + balance1);
    await splitRevenue.withdraw({from: fan1});
    //let balance2 = await splitPayment.getBalance.call(fan1);
    //console.log(balance2.toNumber());
    let balance2 = await web3.eth.getBalance(fan1);
    console.log('balance2: ' + balance2);
    let balanceDiff = balance2 - balance1; //estimateGas web3 . minus that. // toWei
    //let correctBalanceDiff =
    assert.isTrue((2000000000000000000 - gasEstimation + 200) < balanceDiff < 2000000000000000000);
  });

  it('artist should be able to withdraw', async () => {   // withdraw correct amount? test for many numbers?
    let balance1 = await web3.eth.getBalance(artist);
    let gasEstimation = await web3.eth.estimateGas(await splitRevenue.withdraw({from: artist}));
    //console.log('gas: ' + gasEstimation);
    let balance2 = await web3.eth.getBalance(artist);
    let balanceDiff = balance1 - balance2;
    assert.isTrue((4000000000000000000 - gasEstimation + 200) < balanceDiff < 4000000000000000000);
  });

  it('artist should not be able to withdraw if artist balance is 0', async () => {   // withdraw correct amount? test for many numbers?
    catchRevert(splitRevenue.withdraw({from: artist}));
  });

  it('fan should be able to withdraw the correct amount after a second payment and first withdrawal', async () => {
    splitRevenueNew = await SplitRevenue.new();
    await splitRevenueNew.addArtist(artist);
    await splitRevenueNew.addFan(fan1);
    await splitRevenueNew.addFan(fan2);
    await splitRevenueNew.openSplit();
    let balanceBefore = web3.eth.getBalance(fan1);
    await splitRevenueNew.paySplit({from: streamingService, value: expectedContractBalance});
    await splitRevenueNew.withdraw({from: fan1});
    await splitRevenueNew.paySplit({from: streamingService, value: expectedContractBalance});
    await splitRevenueNew.paySplit({from: streamingService, value: expectedContractBalance});
    await splitRevenueNew.withdraw({from: fan1});
    let balanceAfter = web3.eth.getBalance(fan1);
    let correctBalanceDiff = ((expectedContractBalance*3)/2)/2; //fan payout hsould be: in is: 1 2 3 hard code. 
    let balanceDiff = balanceAfter -balanceBefore;  // specifct nr of fans top. for 2 fan. or get from state. 
    assert.isTrue( (correctBalanceDiff - 100000000000000000) < balanceDiff < correctBalanceDiff);
  }); // max fancount later

  it('fan should not be able to withdraw if balance is 0', async () => {
    catchRevert(splitRevenue.withdraw({from: fan1}));
  });

  it('not fan and not artist should not be able to withdraw', async () => {
    catchRevert(splitRevenue.withdraw({from: streamingService}));
  });

  it('owner should be able to stop contract paying in emergency', async () => {
    await splitRevenue.emergency();
    catchRevert(splitRevenue.paySplit({from: streamingService, value: expectedContractBalance}));
  });

  it('not owner should not be able to stop contract paying in emergency', async () => {
    catchRevert(splitRevenue.emergency({from: fan1}));
  });

  it('owner should be able to continue contract paying in end of emergency', async () => {
    await splitRevenue.emergency();
    await splitRevenue.paySplit({from: streamingService, value: expectedContractBalance});
    let balance1 = await web3.eth.getBalance(splitRevenue.address);

    assert.equal(balance1, 6000000000000000000, 'Correct balance is not in the contract.');
  });

  it('owner should be able to kill contract in Creation stage', async () => {
    splitRevenueNew = await SplitRevenue.new();

    await splitRevenueNew.kill();
    let bc = await web3.eth.getCode(splitRevenueNew.address);
    console.log(bc);
    assert.equal(bc, '0x', 'Hi hi baddest bytecode in town is still here. ')
  });

  it('other people than owner should not be able to kill contract in Creation stage', async () => {
    catchRevert(splitRevenue.kill({from: fan1}));
  });

  it('owner should not be able to kill contract in Open stage', async () => {
    //await splitPayment.openSplit();
    //let currentStage = await splitPayment.stage();
    //console.log(currentStage); 
    catchRevert(splitRevenue.kill());
   });
});



  //Testing modifiers



/** 
  it('should be able to receive eth and split 50 % to artist and split 50 % equally between all fans.', async () => {
    let expectedContractBalance = 3000000000000000000;
    let expectedArtistSplit = (3000000000000000000/2);
    let expectedFanSplit = (1500000000000000000/2);

    await web3.eth.sendTransaction({from: streamingService, to: splitPayment.address, value: 3000000000000000000});
    let balance = await web3.eth.getBalance(splitPayment.address);
    
    assert.equal(balance, expectedContractBalance, 'Contract did not receive 3 eth');
    assert.equal(splitPayment.artistSplit, expectedArtistSplit, 'artist split is not receive 50 % of income');
    assert.equal(splitPayment.expectedFanSplit, expectedFanSplit, 'fan split is not 50% of income divided by total number of fans');
  });

  it('owner should be able to withdraw funds for artist and fans', async () => {
    await splitPayment.withdraw();
    let balance = web3.eth.getBalance(splitPayment.address) //funkar bara splitPayment.balance?
    
    assert.equal(balance<100, true, 'funds have not been withdrawn from contract.');
  });

  it('should be killable by owner only after funds are withdrawn to artists and fans. ', async () => { //and balance over 0? write all the detable and test all details in each test? for example modifiers as well?
    await splitPayment.kill();
    
  });
  */
