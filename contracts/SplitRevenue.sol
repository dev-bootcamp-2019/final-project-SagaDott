pragma solidity ^0.5.0;

import "./SafeMath.sol"; 
import "./Ownable.sol";


/// @author Saga Arvidsdotter - <hello@sagaarvidsdotter.com>
/// @title SplitRevenue - Splitting revenue from a song between artist and fans. 
 
 
contract SplitRevenue is Ownable {
    using SafeMath for uint256; 

    event ArtistAddition(address indexed artistFeatured);
    event FanAddition(address indexed fansFeatured);
    event RevenueDeposit(uint256 indexed revenue);
    event ArtistRevenuePayment(uint256 indexed artistRevenuePayment);
    event FanRevenuePayment(uint256 indexed fanRevenuePayment); 
    event SelfDestruction(string indexed message); 

    mapping(address => bool) public fanExists;
    mapping(address => uint256) private _fanEthReleased; //split pattern 
    address payable public artist;
    uint256 private artistSplit; // artistSplitCurrent
    uint256 private fansSplitTotal; //split pattern fmr: fansSplit
    uint256 public fansCount; //split pattern

    // State Machine  
    Stages public stage = Stages.Creation;

    enum Stages {
        Creation, Open
    }

    modifier atStage(Stages _stage) {
        require(stage == _stage, "Function can not be called at this time.");
        _;
    }

    function nextStage() internal {
        stage = Stages(uint256(stage) + 1);
    }

    // Circuit Breaker different contract file
    bool public stopped = false;

    modifier stopInEmergency {
        require(!stopped, "Emergency; this function can not be called.");
        _;
    }

   
    /// Public functions. 
   
    /// @dev Contract constructor sets starting values of balances and number of fans to 0.    
    constructor() public {
        artistSplit = 0;
        fansCount = 0;
        fansSplitTotal = 0;
    }

    /// @dev Allows anyone to deposit ether and split half for the artist and half equally between fans.
    /// @dev Access is restricted to stage Open. An owner can disallow access in emergency. 
    function paySplit() 
        external 
        payable 
        atStage(Stages.Open) 
        stopInEmergency 
    {
        require(msg.value > 0, "enough funds have not been provided"); //behövs?
        //require(msg.data.length == 0); ?
        require(fansCount >= 1, "not enough fans in contract");

        artistSplit =  artistSplit.add(msg.value.div(2)); 
        fansSplitTotal += msg.value.div(2); 

        emit RevenueDeposit(msg.value);
    }
  
    /// @dev Allows an owner to add an artist if one does not exist yet.
    /// @dev Access is restricted to the Creation stage. 
    /// @param _artist Address of artist.   
    function addArtist(address payable _artist) 
        public 
        onlyOwner 
        atStage(Stages.Creation) 
    {
        require(_artist != address(0), "you have not supplied a valid address");
        require(address(artist) == address(0), "artist address already exists"); 
        artist = _artist;

        emit ArtistAddition(_artist);
    }
   
    /// @dev Allows an owner to add a new fan. 
    /// @dev Access is restricted to the Creation stage.
    /// @param _fan Address of new fan.   
    function addFan(address payable _fan) 
        public 
        onlyOwner 
        atStage(Stages.Creation) 
    { 
        require(_fan != artist, "address is already the artist");
        require(_fan != address(0), "you have not supplied a valid address");
        require(fanExists[_fan] == false, "fan address already exists");

        fanExists[_fan] = true;
        fansCount = fansCount.add(1); 

        emit FanAddition(_fan);
    }
   
    /// @dev Allows an owner to change stage from Creation to Open. 
    /// @dev Access is restricted to stage Creation.  // behövs?
    function openSplit() 
        public 
        onlyOwner 
        atStage(Stages.Creation) 
    { 
        nextStage();
    }
   
    /// @dev Allows a fan or artist to withdraw their ether split. 
    /// @dev Access is restricted to stage Open. 
    function withdraw() 
        public 
        atStage(Stages.Open) 
    {  //withdraw pattern
        require(address(this).balance > 0, "contract balance is not enough for withdraw");
        require(fansCount >= 1, "not enough fans in contract");
        
        if(fanExists[msg.sender]){
            fanWithdraw();
        } else if(msg.sender == artist) {
            artistWithdraw();
        } else {
            revert("msg.sender is not a fan or an artist");
        }
    }
  
    /// @dev In emergency allows an owner to toggle an access restriction modifier on and off.
    /// @dev Access is restricted to stage Open.  
    function emergency() 
        public 
        onlyOwner 
        atStage(Stages.Open) 
    {
        stopped = !stopped;
    }
 
    /// @dev Allows an owner to self destruct contract.
    /// @dev Access is restriced to stage Creation. 
    function kill() 
        public 
        onlyOwner 
        atStage(Stages.Creation) 
    {
        emit SelfDestruction("Contract Self Destructed"); //funkar detta?

        selfdestruct(msg.sender);
    }

    
    /// Private functions.  //or internal?

    /// @dev Transfer artist remaining ether split to artist address. //write remaining or not remaining?
    /// @dev Access is restricted to stage Open.  //skriva det eller är det redan antaget? skriva mer för att visa intern func?
    function artistWithdraw() 
        private 
        atStage(Stages.Open) 
    {
        uint256 artistSplitWithdraw = artistSplit;
        require(artistSplitWithdraw != 0, "artist balance is 0");
        artistSplit = 0; //preventing re-entrancy attacks (race conditions)
        artist.transfer(artistSplitWithdraw);

        emit ArtistRevenuePayment(artistSplitWithdraw);
    }
    
    /// @dev Transfer fan's remaining ether split to fan address. //fan's?
    /// @dev Access is restricted to stage Open. 
    function fanWithdraw() 
        private 
        atStage(Stages.Open) 
    { /// time
        uint256 payment = fansSplitTotal.div(fansCount).sub(_fanEthReleased[msg.sender]); 
        require(payment != 0, "payment is 0"); // >0 ?
        assert(address(this).balance >= payment);
        assert(fansSplitTotal >= payment); // behövs båda?

        _fanEthReleased[msg.sender] = _fanEthReleased[msg.sender].add(payment);
        msg.sender.transfer(payment);

        emit FanRevenuePayment(payment);
    }

    /*
    * Web3 call functions
    */

    // getFanExists() //mapping så denna behövs?
    // getArtist() finns dessa redan i o m public?
    // getFanCount()
    // get()
}
