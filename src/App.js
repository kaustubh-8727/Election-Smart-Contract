import React, { Component } from "react";
import Voting from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import Web3 from 'web3';

import "./App.css";

class App extends Component {

  constructor(props) {
  super(props)
  this.state = {
    creator:'',
    contract:'',
    account: '',
    candidates:[],
    result:[],
    showResultVote:{
      id:'',
      name:'',
      votes:''
    },
    isActive: true,
    endResult:[],
    candidatesCount:'',
    userVoted:'',
    check:false,
    checkForVote:false,
    showClick:false
  }
  this.answerselect = this.answerselect.bind(this);
  this.hasVoted = this.hasVoted.bind(this);
  this.showvote = this.showvote.bind(this);
  this.endvote = this.endvote.bind(this);

}

async componentWillMount() {
  await this.loadWeb3();
  await this.loadBlockchainData();
}

async componentDidMount() {
  await this.loadWeb3();
  await this.loadBlockchainData();
  }

async loadWeb3() {
  if (window.ethereum) {
    window.web3 = await new Web3(window.ethereum)
    await window.ethereum.enable()
  }
  else if (window.web3) {
    window.web3 = await new Web3(window.web3.currentProvider)
  }
  else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }
}

async loadBlockchainData() {
  let candi;
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId()
    const networkData = Voting.networks[networkId]
    if(networkData) {
      const vote = await new web3.eth.Contract(Voting.abi, networkData.address);
      this.setState({contract:vote});
      console.log(vote._address);
      const respons = await vote.methods.candidatesCount().call();
      this.setState({candidatesCount:respons});

      const check = await vote.methods.votingEnded().call();
      this.setState({check:check});

      const creator = await vote.methods.Creator().call();
      this.setState({creator:creator});
      console.log(creator);

      const checkForVote = await vote.methods.hasVoted(this.state.account).call();
      this.setState({checkForVote:checkForVote});
      console.log(checkForVote);

      //console.log(this.state.candidatesCount);
      let arr = this.state.candidates.slice();
      var index=0;
      for (var i = 1; i <= this.state.candidatesCount; i++){
        candi = await vote.methods.candidates(i).call();
        arr[index]=candi;
        index++;
        //console.log(this.state.candidates);
      }
      this.setState({candidates:arr});
    } else {
      window.alert('Selling contract not deployed to detected network.')
    }
  }
  hasVoted() {
    if(this.state.check==false){
      if((this.state.userVoted) && this.state.userVoted!="N/A"){
        this.state.contract.methods.voteForCandidate(this.state.userVoted).send({ from: this.state.account });
        console.log(this.state.userVoted);
        //console.log(this.state.result);
      }
      else{
        alert("please select your candidate");
      }
    }
    else{
      alert("Voting has Ended");
    }
  }
  answerselect(event){
    console.log(event.target.value);
    this.setState({userVoted:event.target.value});
    console.log(this.state.userVoted);
  }
  async endvote(){
    if(this.state.creator == this.state.account){
      this.state.contract.methods.endVoting().send({ from: this.state.creator });
      const check = await this.state.contract.methods.votingEnded().call();
      this.setState({check:check});
    }
    else{
      alert("Only Creator Can End The Vote");
    }
  }
  async showvote(){
    let res = this.state.result.slice();
    var index=0;
    let candi;
    for (var i = 1; i <= this.state.candidatesCount; i++){
      candi = await this.state.contract.methods.totalVotesFor(i).call();
      console.log(candi);
      res[index]=candi;
      index++;
    }
    this.setState({result:res});
    this.setState({showClick:true});
    //console.log("showvote");
    let showres = this.state.showResultVote;
    let endshow =this.state.endResult.slice();
    index=0;
    for (var j = 0; j < this.state.candidatesCount; ++j){
      //console.log(this.state.candidates[j].id+" "+this.state.candidates[j].name +"="+this.state.result[j]);
      // showres.id=this.state.candidates[j].id;
      // showres.name=this.state.candidates[j].name;
      // showres.votes=this.state.result[j];
      // endshow[index].id=this.state.candidates[j].id;
      // endshow[index].name=this.state.candidates[j].name;
      // endshow[index].votes=this.state.result[j];
      showres={
        id:this.state.candidates[j].id,
        name:this.state.candidates[j].name,
        votes:this.state.result[j]
      }
      endshow.push(showres);
      //endshow[index]="Candidate ID = "+this.state.candidates[j].id+" "+"Candidate Name = "+this.state.candidates[j].name+" "+"Votes = "+this.state.result[j];
      //console.log(showres);
      index++;
    }
    this.setState({showResultVote:showres});
    this.setState({endResult:endshow});
    this.setState({isActive:false});
    console.log(this.state.endResult);
  }
  render(){
    var arr=this.state.candidates;
    var res=this.state.result;
    //console.log(arr);
    let showToVote;
    if(this.state.checkForVote==false){
      if(this.state.account!=this.state.creator){
        showToVote=<div className="vote">
                        <div className="vote1">
                            <h4>Please Select Your Candidate : </h4>
                            <select id="votes"  onChange={this.answerselect}>
                              <option value="N/A">N/A</option>
                              {arr.map(ob=>(
                                  <option className="selectcandidate" value= {ob.id} >{ob.name}</option>
                              ))}
                            </select>
                        </div>
                        <div className="vote2">
                          <button onClick={this.hasVoted}>Vote</button>
                       </div>
                  </div>
      }
      else{
        showToVote=<h4 className="showToVote">Creator cannot vote!!</h4>
      }
    }
    else{
      showToVote=<h4 className="showToVote">Thanks For Your Vote!!</h4>
    }
    let showResult;
    if(this.state.showClick){
        showResult=<div>
                      <div className="Table">
                          <table className="table">
                                <thead>
                                  <tr>
                                    <th>Candidate ID</th>
                                    <th>Candidate Name</th>
                                    <th>Votes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {this.state.endResult.map(ob=>(
                                      <tr>
                                        <td>{ob.id}</td>
                                        <td>{ob.name}</td>
                                        <td>{ob.votes}</td>
                                      </tr>
                                  ))}
                               </tbody>
                           </table>
                      </div>
                   </div>
    }
    let endvote;
    if(this.state.check==false){
      endvote=<button className="endvote" onClick={this.endvote}>End Vote</button>
    }
    else{
      endvote=<h4 className="voteEnd">Voting is Ended!!!!</h4>
    }

    let show;
    if(this.state.check){
      if(this.state.isActive){
        show=<div className="show">
        <button className="showvote" onClick={this.showvote}>Show Result</button></div>
      }
    }
    else{
      show=<div>
                <div className="Table">
                    <table className="table">
                          <thead>
                            <tr>
                              <th>Candidate ID</th>
                              <th>Candidate Name</th>
                              <th>Votes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {arr.map(ob=>(
                                <tr>
                                  <td>{ob.id}</td>
                                  <td>{ob.name}</td>
                                  <td>?</td>
                                </tr>
                            ))}
                         </tbody>
                     </table>
                </div>
                <div className="vote2">
                    {showToVote}
                </div>
                <div className="endshowvote">
                    {endvote}
                </div>
          </div>
    }


    return (
      <div className="App">
          <header className="App-header">
            <h1>Election Smart Contract</h1>
          </header>
          <h3 className="account">Your Account : {this.state.account}</h3>
        {show}
        {showResult}
     </div>
    );
  }
}

export default App;
