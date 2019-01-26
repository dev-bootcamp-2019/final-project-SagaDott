# Avoiding Common Attacks 
This text describes how common attacks are avoided in the contracts. 

## Reentrancy & Cross-function Race Conditions
To avoid reentrancy the accounting is done before transfering funds. The artist's and fan's available balance is 0 after a withdraw. This way it is not possible to withdraw a second or more times unless new funds is added to the contract. Avoiding reentrancy is also done by using .transfer() instead of .call.value(). 

## Integer Overflow & Underflow
OpenZeppelin's SafeMath library is used for the SplitRevenue contract, reverting functions instead of letting overflow and underflow occur.

## Denial of Service 
For a group of fans to withdraw the simplest implementation in traditional development is storing them in an array and iterating to transfer for each fan. Iterating over an array exposes risk to Denial of Service attack, therefore instead a withdrawal pattern is implemented where each fan withdraw their own balance. 


