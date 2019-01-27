const path = require("path");
require("dotenv").config();
const HDWallet = require('truffle-hdwallet-provider');
const infuraKey = process.env.INFURA_PROJECT_ID;
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: "8545",
      network_id: "*", 
    },
    rinkeby: {
      provider: () => new HDWallet(mnemonic, `https://rinkeby.infura.io/${infuraKey}`),
      network_id: 4,          
      gas: 5500000,      
    }
  },
  contracts_build_directory: path.join(__dirname, "client/src/contracts")
};
