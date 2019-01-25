import React, { Component } from "react";
import SplitRevenueContract from "./contracts/SplitRevenue.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";

class App extends Component {
  state = { storageBalance: 0, paymentAmount: 0, artistAddress: "", fanAddress: "", open: false, web3: null, accounts: null, contract: null }; //sätt storageBalance efter riktiga balances, hämta den!
  //when react state changes the app is rerendered. 
  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SplitRevenueContract.networks[networkId];
      const instance = new web3.eth.Contract( //returns object contract instance, not promise not await. 
        SplitRevenueContract.abi,
        deployedNetwork && deployedNetwork.address, //check json build if matching network id.
      );
        //deployed() a part of truffle
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  convertFromWei = (response) => {
    const { web3 } = this.state;
    let res = web3.utils.fromWei(response.toString(), 'ether');
    //console.log(res);
    return res;
  };

  runExample = async () => {

    const { web3, accounts, contract } = this.state;
    console.log(contract);
    //const contract = this.state.contract;

    // Stores a given value, 0 by default.
    //await contract.methods.set(0).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
   // contract = await contract.deployed();
   //console.log(contract);
   //console.log(contract._address);
   //console.log(this.state);
   
    const response = parseInt(await web3.eth.getBalance(contract._address));
    //const response = 4;
    // Update state with the result.
    this.setState({ storageBalance: response });
  };

  handleClickPay = async (event) => {
    const { web3, accounts, contract } = this.state;
    //const contract = this.state.contract;
    //const account = this.state.account;

    var value = 3000000000000000000;
    await web3.eth.sendTransaction({from: accounts[0], to: contract._address, value})
    //await contract.methods.set(value).send({ from: accounts[0]}); // why not transfer?

    //const response = 7;
    const response = parseInt(await web3.eth.getBalance(contract._address));
    this.setState({ storageBalance: response });
  };

  handleClickWithdraw = async (event) => {
    event.preventDefault ();

    const { web3, accounts, contract } = this.state;
    await contract.methods.withdraw().send({ from: accounts[0] });
    //console.log(await contract.methods);
    //const response = parseInt(await web3.eth.getBalance(contract._address));
    //this.setState({ storageBalance: response });
    //this.forceUpdate();
    // ADD reload!!
  };

  handleSubmitArtist = async (event) => {
    event.preventDefault ();

    const {web3, accounts, contract, artistAddress } = this.state;

    await contract.methods.addArtist(artistAddress).send({ from: accounts[0] });
    console.log(artistAddress);

    //this.state.artistAddress = ""; // vill att input-fältet ska visa 0. ej state i appen. 
  };

  handleSubmitFan = async (event) => {
    event.preventDefault ();

    const {web3, accounts, contract, fanAddress } = this.state;

    await contract.methods.addFan(fanAddress).send({ from: accounts[0] });
    console.log(fanAddress);
  };

  handleOpen = async (event) => {
    event.preventDefault ();

    const {web3, accounts, contract, open } = this.state;

    await contract.methods.openSplit().send({ from: accounts[0] });
    this.setState({open: true});
    console.log(this.state.open);
  };



  handleEmergency = async (event) => {

  }

  handleKill = async (event) => {

  }

  handleSubmitPayment = async (event) => {
    event.preventDefault ();

    const { web3, accounts, contract, paymentAmount } = this.state;
    //const { storageBalance: newState } = this.state;

    const paymentAmountWei = await web3.utils.toWei(paymentAmount);

    //await web3.eth.sendTransaction({ from: accounts[0], to: contract._address, value: paymentAmountWei });
    await contract.methods.paySplit().send({ from: accounts[0], value: paymentAmountWei});
    this.state.paymentAmount = 0;

    const response = parseInt(await web3.eth.getBalance(contract._address));
    //web3.utils.fromWei(response, 'ether');
    //response = await web3.utils.fromWei(response);
    //console.log(response);
    const responseInEth = this.convertFromWei(response);
    //console.log(responseInEth);
    this.setState({ storageBalance: responseInEth });
  };

  getArtistBalance = () => {

    let { contract } = this.state;
    let balance = contract.methods.artistSplit();
    console.log(balance);
    return balance.toString();
  }
/** 
  handleContractStateSubmit (event) {
    event.preventDefault ();

    const { set } = this.state.contract;
    const { storageBalance: newState } = this.state; // ta bort senare när jag hämtar balances direkt från kontraktet. 

    set (
      newState,
      {
        gas: 300000,
        from: accounts[0],
        value: window.web3.toWei (0.01 + newState, 'ether')
      }
    )
  }
*/
  /** handlePaymentClick = async (event) => { //change to input int 
    const { accounts, contract } = this.state;
    
    await contract.methods.set(event).send({ from: accounts[0]}); // change to input int
    const response = await contract.methods.get().call();
    this.setState({ storageValue: response });
  }

  handleWithdrawClick = async (event) => {

  }

  handleSelfDestructClick = async (event) => {

  }

  // Later: handleAddArtist() handleAddFan()
  */

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div>Logged-in Account: {this.state.accounts[0]} </div>

        <h1> Mycelia LIVEBITE </h1>
        <h2> Half Life - Splitting the streaming revenue of a song </h2>
        <p>A one year crypto experiment with music maker Imogen Heap</p>
        <div>The stored balance is: {this.state.storageBalance}</div>
        <div>The artist address is: {}</div>
        <div></div>
        <form onSubmit={this.handleSubmitArtist}>
          <input 
          type="string"
          placeholder="Enter artist address..."
          value={this.state.artistAddress}
          onChange={ event => this.setState ({ artistAddress: event.target.value })}
          />
          <button type="submit"> Add Artist </button>   
        </form>
        <form onSubmit={this.handleSubmitFan}>
          <input 
          type="string"
          placeholder="Enter fan address..."
          value={this.state.fanAddress}
          onChange={ event => this.setState ({ fanAddress: event.target.value })}
          />
          <button type="submit"> Add Fan </button>   
        </form>
        <button onClick={this.handleOpen.bind(this)}>Open Split</button>
        <form onSubmit={ this.handleSubmitPayment}>
          <input 
            type="number"
            placeholder="Enter payment amount..."
            value= { this.state.paymentAmount }
            onChange= { event => this.setState ({ paymentAmount: event.target.value }) } />
          <button type="submit"> Pay </button>
        </form>    
        <button onClick={this.handleClickWithdraw.bind(this)}>Withdraw ETH</button>
        <button onClick={this.handleEmergency.bind(this)}>Contract Emergency Stop</button>
        <button onClick={this.handleKill.bind(this)}>Delete Contract</button>

        <div> Contract Revenue: {this.state.accounts[0]} </div>
        

      </div>
    );
  }
}
/*
<button onClick={this.handleClickPay.bind(this)}>Pay 3 ETH</button>*/

/** <form onSubmit={ this.handleContractStateSubmit}>
          <input 
          type="number"
          placeholder="Enter payment amount..."
          value= { this.state.storageValue }
          onChange= { event => this.setState ({ storageBalance: event.target.value }) } />
          <button type="submit"> Submit </button>
        </form>
        */
export default App;
/** <div> Artist Split: {this.getArtistBalance()} </div>
        <div> Fan Split: {this.state.accounts[0]} </div> */

/**import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 0 by default.
    await contract.methods.set(0).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  handleClick = async (event) => {
    const { accounts, contract } = this.state;
    //const contract = this.state.contract;
    //const account = this.state.account;

    var value = 3;

    await contract.methods.set(value).send({ from: accounts[0]}); // why not transfer?
    const response = await contract.methods.get().call();
    this.setState({ storageValue: response });
  };

  handleContractStateSubmit (event) {
    event.preventDefault ();

    const { set } = this.state.contract;
    const { storageValue: newState } = this.state; // ta bort senare när jag hämtar balances direkt från kontraktet. 

    set (
      newState,
      {
        gas: 300000,
        from: accounts[0],
        value: window.web3.toWei (0.01 + newState, 'ether')
      }
    )
  }

  /** handlePaymentClick = async (event) => { //change to input int 
    const { accounts, contract } = this.state;
    
    await contract.methods.set(event).send({ from: accounts[0]}); // change to input int
    const response = await contract.methods.get().call();
    this.setState({ storageValue: response });
  }

  handleWithdrawClick = async (event) => {

  }

  handleSelfDestructClick = async (event) => {

  }

  // Later: handleAddArtist() handleAddFan()
  */
/*
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 40</strong> of App.js.
        </p>
        <div>The stored balance is: {this.state.storageValue}</div>
        <button onClick={this.handleClick.bind(this)}>Set Storage</button>
        <form onSubmit={ this.handleContractStateSubmit}>
          <input 
          type="number"
          placeholder="Enter payment amount..."
          value= { this.state.storageValue }
          onChange= { event => this.setState ({ storageValue: event.target.value }) } />
          <button type="submit"> Submit </button>
        </form>
      </div>
    );
  }
}

export default App;
 */