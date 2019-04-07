import React, { Component } from 'react';
import SplitRevenueContract from "../contracts/SplitRevenue.json";
import getWeb3 from "../utils/getWeb3";

class InteractiveView extends Component {
  state = { storageBalance: "",
            paymentAmount: "",
            revenue: 0,
            artistAddress: "",
            artistAddressContract: "",
            fanAddress: "",
            fanSubmitted: "",
            open: "",
            emergencyMessage: "",
            killed: "",
            web3: null,
            accounts: null,
            contract: null,
            owner: null

          }; //sätt storageBalance efter riktiga balances, hämta den!
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
      let contractOwner = await instance.methods.owner().call({ from: accounts[0] })

        //deployed() a part of truffle
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, owner: contractOwner }, this.runExample);
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

    let artistA = await contract.methods.artist().call({ from: accounts[0]});

    this.setState({ artistAddressContract: artistA });

    //this.state.artistAddress = ""; // vill att input-fältet ska visa 0. ej state i appen.
  };

  handleSubmitFan = async (event) => {
    event.preventDefault ();

    const {web3, accounts, contract, fanAddress } = this.state;

    await contract.methods.addFan(fanAddress).send({ from: accounts[0] });
    console.log(fanAddress);

    let fanNew = await contract.methods.fanExists(fanAddress).call({ from: accounts[0]});
    if(fanNew) {
      this.setState({fanSubmitted: fanAddress});
    } else {
      console.log('fan not submitted');
    }
    this.setState({fanAddress: ""});

  };

  handleOpen = async (event) => {
    event.preventDefault ();

    const {web3, accounts, contract, open } = this.state;

    await contract.methods.openSplit().send({ from: accounts[0] });
    this.setState({open: true});
    console.log(this.state.open);
    let openContract = await contract.methods.stage().call({ from: accounts[0]});
    if(openContract == 0) {
      this.setState({open: "Creation"});
    } else if(openContract == 1) {
      this.setState({open: "Open"});
    }
  };



  handleEmergency = async (event) => {
    event.preventDefault ();
    const {web3, accounts, contract, emergency } = this.state;

    await contract.methods.emergency().send({ from: accounts[0] });
    let stopped = await contract.methods.stopped().call({ from: accounts[0] });

    if(!stopped) {
      this.setState({emergencyMessage: "" });
    } else if(stopped) {
      this.setState({emergencyMessage: "active emergency"});

    }
  }

  handleKill = async (event) => {
    const {web3, accounts, contract, open } = this.state;
    event.preventDefault ();
    await contract.methods.kill().send({ from: accounts[0] });


  }

  handleSubmitPayment = async (event) => {
    event.preventDefault ();

    const { web3, accounts, contract, paymentAmount, revenue } = this.state;
    //const { storageBalance: newState } = this.state;

    const paymentAmountWei = await web3.utils.toWei(paymentAmount);

    //await web3.eth.sendTransaction({ from: accounts[0], to: contract._address, value: paymentAmountWei });
    await contract.methods.paySplit().send({ from: accounts[0], value: paymentAmountWei});
    this.setState({paymentAmount: ""}); //funkar inte? setState gäller.
    //let newRevenue = revenue + paymentAmount;
    //this.setState({revenue: newRevenue });
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

  ownerView = () => {
    const {accounts, owner} = this.state;
    //console.log("ownerView!");
    //console.log(owner);
    //console.log(accounts[0]);

    if(accounts[0] === owner) {
      return (
        <div className="Access-O"> Owner Access
        <form onSubmit={ this.handleSubmitArtist }>
          <input
          type="string"
          placeholder="Enter artist address..."
          value={this.state.artistAddress}
          onChange={ event => this.setState ({ artistAddress: event.target.value })}
          />
          <button type="submit"> (1) Add Artist </button>
        </form>
        <form onSubmit={this.handleSubmitFan}>
          <input
          type="string"
          placeholder="Enter fan address..."
          value={this.state.fanAddress}
          onChange={ event => this.setState ({ fanAddress: event.target.value })}
          />
          <button type="submit"> (1) Add Fan </button>
        </form>
        <div>
        <button onClick={this.handleKill.bind(this)}> (1) Delete Contract</button>
        </div>
        <div>
        <button onClick={this.handleOpen.bind(this)}> (2) Open Split </button>
        </div>
        <div>
        <button onClick={this.handleEmergency.bind(this)}> (3, 4) Contract Emergency Stop</button>
        </div>
        </div>
      );
    }
  }
  /**

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
      <div>
        <div className="App">
        <div className="big-text">
          <h1> Half Life </h1>
        </div>
          <div className="App-info">
            <div className="info-background">
              <div>Logged-in Account: {this.state.accounts[0]} </div>
              <h1>
                <a href="http://myceliaformusic.org/">
                <div className="Logo" />
                </a>
              </h1>
              <h2> Half Life - Splitting the streaming revenue of a song </h2>
              <p>A one year crypto experiment with music maker Imogen Heap</p>
              <div>The stored balance is: {this.state.storageBalance}</div>
              <div>The artist address is: {this.state.artistAddressContract}</div>
              <div>Fan just submitted: {this.state.fanSubmitted}</div>
              <div>The contract is in stage: {this.state.open}</div>
              <div> Emergency: {this.state.emergencyMessage}</div>
              <div> Contract Revenue:  </div>
            </div>
          </div>
          <div className="App-interaction">
            <div className="row">
              {this.ownerView()}
            </div>
            <div className="row">
              <div className="Access-AF"> Artist & Fan
                <div>
                  <button onClick={this.handleClickWithdraw.bind(this)}> Withdraw ETH</button>
                </div>
                </div>
              </div>
            <div className="row">
              <div className="Access-S"> Streaming Service
                <form onSubmit={ this.handleSubmitPayment}>
                  <input
                    type="number"
                    placeholder="Payment amount..."
                    value= { this.state.paymentAmount }
                    onChange= { event => this.setState ({ paymentAmount: event.target.value }) }
                  />
                  <button type="submit"> Pay in ETH </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default InteractiveView;
