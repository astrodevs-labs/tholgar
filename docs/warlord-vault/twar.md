---
order: 4
---

# $tWAR

## What is $WAR ?

$WAR is an ERC-20 token that is perpetually redeemable for its underlying assets. As a governance index, WAR is comprised of Convex ($CVX) and Aura ($AURA), which are vote-locked to generate yield. All rewards and yields are distributed to $WAR stakers. Currently, $WAR only supports these two assets, but the system can be adapted to accommodate other vlTokens.

The only way to mint $WAR is by depositing either $CVX or $AURA, or both. Upon minting, users will receive $WAR directly. To begin earning with $WAR, users must stake their $WAR tokens to receive rewards and vote-incentive yields. Vote incentives are distributed in $WETH and are managed by Paladin’s delegation address. $BAL and $CRV are earned as $auraBAL and $cvxCRV, allowing users to farm more $AURA & $BAL and $CVX & $CRV until claimed. Other rewards also include $PAL, $FXS and $cvxFXS. Furthermore, any $AURA or $CVX earned is automatically compounded into more $WAR. Users who do not stake their $WAR tokens forfeit their yield to other stakers.

Users who want to exit the Warlord system will need to redeem their $WAR tokens for their underlying assets. The redemption ratio will be determined by the current ratio of locked assets within the system. After redemption, the $WAR will be queued for the unlock date of each corresponding asset. $CVX and $AURA will have separate unlock dates depending on their availability. Once these assets become available, users will be able to claim their tokens. Please note that assets in the redemption queue do not generate yield.

## What is $tWAR ?

$tWAR is an ERC-20 token that represents shares of the underlying amount of $WAR held within the Warlord Vault. For instance, if a user holds 10 $tWAR tokens and the total amount of $tWAR in circulation is 1000, the user owns 1% of the $WAR held in the Vault.

It uses the ERC-4626 standard to implement this feature and adhere to industry standards. This token will then be compatible with other DeFi protocols.

The Warlord Vault is an auto-compounder, which means that instead of earning yield directly through $WAR, it will claim this yield and then automatically reinvest it every week to accumulate more $WAR.

## How does the auto-compounding work ?

The Tholgar team has implemented the auto-compounder in a way that it claims all the rewards every week and subsequently reinvests them into the Vault. To optimize the yield in the long term, it refrains from claiming $cvxCRV and $auraBAL rewards initially, allowing it to farm more $WAR and incur fewer gas fees. Additionally, it conducts arbitrage to adjust the current weight of $CVX and $AURA to mint more $WAR.

The process begins with harvesting rewards using the **harvest** function and swapping them through a router, such as Paraswap, into feeToken. Following this, we compound the rewards using the **compound** function and swap the feeToken back into $CVX or $AURA, allowing us to mint more $WAR and stake it.
  
The entire code for the server responsible for making these calls is open source and can be found in the operator directory. Additionally, our future goal is to transition from a centralized server to a decentralized method for making these calls.

## Fees

The vault charges a **5%** fee exclusively on the WETH portion of the yield (excluding directly harvested $WAR). This fee is used to cover gas expenses and will decrease as the Vault expands.

## Security

All the funds held by the Vault are non-custodial, meaning that admins will never have access to them.

At the current stage, the Vault has not undergone a formal security audit. Nevertheless, the contracts have undergone extensive internal testing & external reviews, instilling confidence in the security measures that have been implemented. We strongly recommend that users conduct their own research and make informed decisions based on their individual risk tolerance.
