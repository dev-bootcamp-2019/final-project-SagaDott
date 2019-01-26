const SplitRevenue = artifacts.require("./SplitRevenue.sol");

contract("SplitRevenue", accounts => {

  let splitRevenue;
  let owner =  accounts[0];
  let artist = accounts[1];
  let fan1 = accounts[2];
  let fan2 = accounts[3];
  let streamingService = accounts[4];
  let expectedContractBalance = 4000000000000000000;
  let catchRevert = require("./exceptions.js").catchRevert; // See file for asserting reverts. 

 /// Testing that all functions work as intended and
 /// that access is restricted properly according to modifiers and require statements. 
 /// When creating a new contract instance,splitRevenureNew, it is to test it without 
 /// disruption the rest of the test flow.  

  beforeEach( async () => {
    splitRevenue = await SplitRevenue.deployed();
  });

  it('should be initialized', async () => { 
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
    catchRevert(splitRevenueNew.addArtist(artist, {from: fan2})); //Assert statement is in exceptions.js
  });

  it('not owner should not be able to add an artist', async () => {
    catchRevert(splitRevenue.addArtist(artist, {from: fan2})); //Assert statement is in exceptions.js
  });

  it('owner should be able to add a fan in Creation stage', async () => {
    await splitRevenue.addFan(fan1);
    await splitRevenue.addFan(fan2);

    let res = await splitRevenue.fanExists.call(fan1);
    let res2 = await splitRevenue.fanExists.call(fan2);

    assert.equal(res, true, 'fan1 address does not exist');
    assert.equal(res2, true, 'fan2 address does not exist');
  });

  it('owner should not be able to add a fan that already exists', async () => {
    catchRevert(splitRevenue.addFan(fan1)); //Assert statement is in exceptions.js
  });

  it('owner should not be able to add a fan in Open stage', async () => {
    splitRevenueNew = await SplitRevenue.new();
    await splitRevenueNew.openSplit();
    catchRevert(splitRevenueNew.addFan(fan1)); //Assert statement is in exceptions.js
  });

  it('not owner should not be able to add a fan', async () => {
    catchRevert(splitRevenue.addFan(fan1, {from: fan1})); //Assert statement is in exceptions.js
  });

  it('owner should be able to change state from Creation to Open', async () => {  
    await splitRevenue.openSplit();
    let res = await splitRevenue.stage()
    assert.equal(res, 1, 'stage is not Open'); //Open stage equals to uint 1. 
  });

  it('not owner should not be able to change state from Creation to Open', async () => {
    catchRevert(splitRevenue.openSplit({from: fan2})); //Assert statement is in exceptions.js
  });

  it('should be able to receive eth in stage Open', async () => {
    await splitRevenue.paySplit({from: streamingService, value: expectedContractBalance}); 
    let balance = await web3.eth.getBalance(splitRevenue.address);
    assert.equal(balance, expectedContractBalance, 'Contract did not receive 4 eth');
  });

  it('should not be able to receive eth in stage Creation', async () => { 
    splitRevenueNew = await SplitRevenue.new();
    catchRevert(splitRevenueNew.paySplit({from: streamingService, value: expectedContractBalance})); 
  });  //Assert statement is in exceptions.js

  it('fan should be able to withdraw', async () => {
    await splitRevenue.paySplit({from: streamingService, value: expectedContractBalance});
    let balance1 = await web3.eth.getBalance(fan1);
    let gasEstimation = await web3.eth.estimateGas(splitRevenue.withdraw({from: fan1}));
    let balance2 = await web3.eth.getBalance(fan1);
    let balanceDiff = balance2 - balance1; 
    assert.isTrue((2000000000000000000 - gasEstimation + 200) < balanceDiff < 2000000000000000000);
  });

  it('artist should be able to withdraw', async () => {  
    let balance1 = await web3.eth.getBalance(artist);
    let gasEstimation = await web3.eth.estimateGas(await splitRevenue.withdraw({from: artist}));
    let balance2 = await web3.eth.getBalance(artist);
    let balanceDiff = balance1 - balance2;
    assert.isTrue((4000000000000000000 - gasEstimation + 200) < balanceDiff < 4000000000000000000);
  });

  it('artist should not be able to withdraw if artist balance is 0', async () => {   
    catchRevert(splitRevenue.withdraw({from: artist})); //Assert statement is in exceptions.js
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
    let gasEstimation = await web3.eth.estimateGas(splitRevenueNew.withdraw({from: fan1}));
    let balanceAfter = web3.eth.getBalance(fan1);
    //correctBalanceDiff: including 3 fan payments from previous 3 test payments. 
    //Calculating based on 2 fans. 
    //The artist get 50 % and the fans split the other 50 % equally.
    let correctBalanceDiff = ((expectedContractBalance*3)/2)/2; 
    let balanceDiff = balanceAfter - balanceBefore;   
    assert.isTrue( (correctBalanceDiff - 2 * gasEstimation + 100) < balanceDiff < correctBalanceDiff);
  }); 

  it('fan should not be able to withdraw if balance is 0', async () => {
    catchRevert(splitRevenue.withdraw({from: fan1})); //Assert statement is in exceptions.js
  });

  it('not fan and not artist should not be able to withdraw', async () => {
    catchRevert(splitRevenue.withdraw({from: streamingService})); //Assert statement is in exceptions.js
  });

  it('owner should be able to stop contract paying in emergency', async () => {
    await splitRevenue.emergency();
    catchRevert(splitRevenue.paySplit({from: streamingService, value: expectedContractBalance}));
  }); //Assert statement is in exceptions.js

  it('not owner should not be able to stop contract paying in emergency', async () => {
    catchRevert(splitRevenue.emergency({from: fan1})); //Assert statement is in exceptions.js
  });

  it('owner should be able to resume contract paying in end of emergency', async () => {
    await splitRevenue.emergency();
    await splitRevenue.paySplit({from: streamingService, value: expectedContractBalance});
    let balance1 = await web3.eth.getBalance(splitRevenue.address);

    assert.equal(balance1, 6000000000000000000, 'Correct balance is not in the contract.');
  });

  it('owner should be able to kill contract in Creation stage', async () => {
    splitRevenueNew = await SplitRevenue.new();

    await splitRevenueNew.kill();
    let bc = await web3.eth.getCode(splitRevenueNew.address);
    assert.equal(bc, '0x', 'Hi hi baddest bytecode in town is still here. ')
  });

  it('other people than owner should not be able to kill contract in Creation stage', async () => {
    catchRevert(splitRevenue.kill({from: fan1})); //Assert statement is in exceptions.js
  });

  it('owner should not be able to kill contract in Open stage', async () => {
    catchRevert(splitRevenue.kill()); //Assert statement is in exceptions.js
   });
});

