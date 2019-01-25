# Avoiding Common Attacks 


## Reentrancy & Cross-function Race Conditions
Setting balance to 0 before
I deduct what has been withdraw.

accounting before transfer. 
## Integer Overflow & Underflow
SafeMath
## Denial of Service 
iterating over array would be DoS!!!!! its about array

//transfering FOR the user would open risk for DoS attack and disable the withdraw function.  Only the address doing the DoS attack will be affected by the Denial of Service. thanks to the withdrawal pattern with one user withdraws for themselves, instead of the service iterating an array for all users.   
