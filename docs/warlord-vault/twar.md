---
order: 4
---

# $tWAR

## What is WAR ?

WAR is an ERC-20 token that is always redeemable for its backing assets. As a governance index, WAR is composed of Convex (CVX) and Aura (AURA) which is vote-locked to generate yield. All rewards and yield are sent back to WAR stakers. At the moment, WAR accepts only these two assets but the system can be adapted to other vlTokens.  
  
The only way to mint WAR is by depositing either CVX or AURA, or both. When minting, users will receive WAR directly. To then start earning with WAR, users must stake WAR to earn their rewards and vote incentive yield. Vote incentives are distributed in WETH and are managed by Paladin’s delegation address. BAL and CRV are earned as auraBAL and cvxCRV to farm more AURA & BAL and CVX & CRV while it's not claimed. Other rewards include PAL, FXS and cvxFXS. Also, any AURA or CVX earned is auto-compounded into more WAR. Users who don’t stake their WAR forfeit their yield to other stakers.  
  
Users who wish to exit the Warlord system will need to redeem their WAR tokens for their backing. The redemption ratio will depend on the current ratio of locked assets within the system. Once redeemed, the WAR will be queued for the unlock date of each asset. CVX and AURA will unlock at separate dates depending on their availability. Once available, users will be able to claim their tokens. Note: assets in the redeem queue do not earn yield.  
  

## What is tWAR ?

tWAR is an ERC20 token that represents the shares of the underlying amount of $WAR held by the vault. It means that for example if a user hold 10 $tWAR and the total amount of $tWAR is 1000, the user owns 1% of the $WAR held in the vault.  
  
It uses the ERC4626 standard to implement this feature and follow industry standard. This token will then be able to be used in other DeFi protocols.  
  
This vault is an auto-compounder meaning that instead of earning yield directly through $WAR, it will claim this yield then recompound it every week for more $WAR.  
  

## How does the auto compounding works ?

We have implemented the auto-compounder in a way that it will claim all the rewards every week and then recompound them into the vault. It will optimize the yield in the long term by not claiming cvxCRV and auraBAL rewards to first farm more WAR and then have less gas fees. It will also arbitrage the current weight of CVX and AURA to mint more WAR.  
  
The process is first we harvest rewards with the **harvest** function and swap them using an router such as Paraswap into feeToken. Then we compound rewards using the **compound** function and swap the feeToken back into CVX or AURA to then mint more WAR and stake it.
  
All of the code of the server that will make the calls is open source and can be found in the operator directory. We also aim in the future to use a decentralised way instead of a centralised server to make the calls.  

## Fees

The only fee taken by the vault is **5%** of the yield harvested only in WETH (excluding WAR directly harvested). This fee is used to cover gas fees and will decline as the Vault grows.

## Security
  
All of the funds held by the Vault are non custodial meaning that admins will never be able to access them.  
  
At the current stage, the vaylt has not undergone a formal security audit. However, the contracts have undergone extensive internal testing & external reviews, giving confidence in the existing security measures implemented. We strongly advise users to conduct their own research and make informed decisions based on their individual risk tolerance.
