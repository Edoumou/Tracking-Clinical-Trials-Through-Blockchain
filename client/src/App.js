import React, { Component } from "react";
import 'semantic-ui-css/semantic.min.css';
import MedTrials from "./contracts/MedTrials.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import NotUser from "./components/NotUser";
import Authority from "./components/Authority/Home";
import PromoterAdmin from './components/Promoter/PromoterAdmin';
import Promoter from "./components/Promoter/Promoter";
import Investigator from "./components/Investigator/Home";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    currentAccount: null,
    contract: null,
    role: ""
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = MedTrials.networks[networkId];
      const instance = new web3.eth.Contract(
        MedTrials.abi,
        deployedNetwork && deployedNetwork.address,
      );

      console.log('CONTRACT =', instance);

      instance.methods.getRole(accounts[0]).call( {from: accounts[0]} )
      .then(role => this.setState({ role: role }));
      
      // Get balance of cutrent account
      await web3.eth.getBalance(accounts[0], (err, balance) => {
        if (!err) {
          this.setState({ balance: web3.utils.fromWei(balance, 'ether') });
        }
      });      

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3, accounts,
        contract: instance,
        currentAccount: accounts[0]
      },
      this.runExample
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    this.setCurrentAccount();
  };

  //============================ setting the curent account ===========================
  setCurrentAccount = async () => {

    await window.ethereum.on('accountsChanged', (accounts) => {

      this.state.contract.methods.getRole(accounts[0]).call( {from: accounts[0]} )
        .then(role => this.setState({ role: role }));

      this.setState({ currentAccount: accounts[0] });
      this.state.web3.eth.getBalance(accounts[0], (err, balance) => {
        if (!err) {
          this.setState({ balance: this.state.web3.utils.fromWei(balance, 'ether') });
        }
      });
    });
  }
  //==================================================================================

  render() {
    const contract = this.state.contract;
    const role = this.state.role;
    const account = this.state.currentAccount;

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    } else if (role === "AUTHORITY ADMIN") {
      return (
        <div className="App ui container">
          <Authority />
        </div>
      );
    } else if (role === "PROMOTER ADMIN") {
      return (
        <div className="App ui container">
          <PromoterAdmin
            contract = {contract}
            role = {role}
            account = {account}
          />
        </div>
      );
    } else if (role === "PROMOTER") {
      return (
        <div className="App ui container">
          <Promoter
            contract = {contract}
            role = {role}
            account = {account}
          />
        </div>
      );
    } else if (role === "INVESTIGATOR") {
      return (
        <div className="App ui container">
          <Investigator />
        </div>
      );
    } else {
      return (
        <div className="App ui container">
            <NotUser />
        </div>
      );
    }

  }
}

export default App;
