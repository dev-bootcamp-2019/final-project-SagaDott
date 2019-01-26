# Design Pattern Decisions 
This text describes design patterns used in the smart contracts and the reasoning behind them.  

## State Machine 
An outer design of the SplitRevenue contract is a state machine, dividing allowed functions in two stages; Creation and Open. In the Creation stage, the owner can add an artist and fans to participate in the split of revenue. In the Open stage, payments can be made to the contract and artist and fans can withdraw their revenue split. This is to make sure the artist and fans can know in advance what percentage of the revenue they are allowed. A state machine also enables the use of a circuit breaker and mortality of the contract, but exclusively at different stages. 

## Withdrawal Pattern 
A withdrawal pattern is implemented for the fans, where the accounting is done separate and before transfering. This is to prevent an attacker from trapping the contract into an unusable state. For example by sending from an address of a contract with a fallback function which fails, could be by using revert() or consuming too much gas when the execution context is passed. By keeping accounting and transferring separate only the attacker's withdrawal will fail and not the rest of the contract.

## Pull over Push Payments
Letting a user withdraw their own funds decrease the cost compared to withdrawing for them by iterating over an array. Iterating over an array would open for external Denial of Service attacks as well as unintentional Denial of Service by the withdrawal function running out of gas if the array is long.

## Mortal
The contract is mortal in stage Creation to enable the owner to self-destruct the contract if needed. In this stage no ether has been sent to the contract to ensure fans and the artist that the owner can not transfer the funds to themselves, by self-destructing the contract.     

## Circuit Breaker  
A circuit breaker is available in stage Open if there is an emergency and payments into the contract needs to be stopped. The withdraw function is still available for the artist and fans to always be able to withdraw their assigned revenue split. The circuit breaker can also be activated when the experiment of splitting song revenue is over, stopping input and only allowing output, from a user perspective.    
 
## Restricting Access 
Administrative functions have been restricted to only be accessed by the owner, like changing stages, activating the emergency circuit breaker and killing the contract. Access to functions adding an artist and fans have been restricted to the owner due to the addresses being provided in advance for this particular experiment. This enables the owner to provide accepted addresses and a limit the number of fans participating. 

## Fail Early and Fail Loud
By using a lot of modifiers and require statements, accessing function bodys is only for the allowed, failing early for the wrong conditions. Modifiers and require statements throws an exception if the condition is not met, failing loud, instead of uncertainty when using if statements as in traditional development. 

## Not Implemented
Auto Deprecation design pattern is not implemented to ensure the artist and fans that they can always withdraw their assigned revenue. A Factory design pattern is not implemented to communicate clearly this particular contracts are a part of a one time experiment. Therefore an upgradable pattern is also not implemented. 





  


