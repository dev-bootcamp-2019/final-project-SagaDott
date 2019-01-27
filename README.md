# Mycelia LIVEBITE 
Mycelia LIVEBITE is a one year experiment with Imogen Heap, where her live recorded song Half Life is being “crowdfunded” through a smart contract on the public Ethereum blockchain. It's one specific use case for how Mycelia Creative Passport can create a new structure for music and disrupt the music industry.

Fans at the concert of the recording were offered a chance to contribute a symbolic amount of money and in turn receive a split of the revenue from streaming the song during a year.

Testing a new way to fund music makers independently from record labels, keeping the security, adding transparency. Streaming data will be visualised for the fans to get insight how money flows in the music industry today.

Will it illustrate the problem with current artist funding? Or will fans get rich from their split? Year 2019 will reveal. Our hypothesis is that the revenue left for the music makers from traditional streaming is very little and this experiment will let fans be a part of that experience. But can blockchain facilitate an alternative?


## Smart Contracts and Blockchain Structure of Value
There is one main smart contract; SplitRevenue, and two library contracts; SafeMath and Ownable from OpenZeppelin. Owner can add the artist and fans from the concert to SplitRevenue. SplitRevenue receives ether from a streaming service and splits it between the artist and fans. The artist get 50 % and the fans share the other 50 % equally. Artist and fans can withdraw their ether split whenever they want from a React, Metamask and web3-enabled DApp frontend. Owner has administrator access to emergency functions in case contract functionality need to be stopped.  

The streaming service is currently traditional streaming services, but a blockchain streaming service can in the future be the sender. A blockchain vision is to have streaming services handle only streaming, music makers own everything regarding their creations and have the ability to plugin for example a "crowdfunding" solution for songs like this SplitRevenue. A more modular, transparent and music maker empowering industry structure.   


## Requirements
* Truffle v5.0.0 - a development framework for Ethereum.
* Solidity v0.5.0 (solc-js)
* Node v10.14.1
* Build essentials tools for your OS. 
* dotenv NPM package
* Metamask

## Running the DApp
1. Clone this repository
2. Add a .evn file in the root directory with your Metamask mnemonic (and infura project-id if you want to deploy to Rinkeby test network).
3. In the repo root directory, run `ganache-cli`
4. Open a terminal tab in the same directory, run `truffle migrate --reset`
5. `cd client` and run `npm install` 
6. In the `client` directory, run `npm run start` 
7. Interact with the application at [http://localhost:3000](http://localhost:3000)

## Testing
In the project root run `truffle test` and you should see 26 tests passing. 

