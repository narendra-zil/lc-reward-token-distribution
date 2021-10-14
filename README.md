# LUNARCRUSH Rewards Distribution

## Table of Content

- [The purpose of project](#purpose-of-project)
- [environment setup](#environment-setup)
- [Running the script](#running-the-script)


### The purpose of project

This project contains a set of scripts which can be used to distribute rewards to set of initial token holders during launch.

### Environment setup
| Parameter | Value    | Description                                           |
|-----------|---------|-------------------------------------------------------|
| NETWORK_URL      | https://dev-api.zilliqa.com | The API server env to connect to. Set it appropriately as per environment. |
| CHAIN_ID      | 333 | SDK expects chainId to initiate the API call. Set it as per env. |
| TOKEN_OWNER_PRIVATE_KEY | value of key | Must be the owner of token holder or other use key who has sufficient balance of tokens to send to holders. |
| TOKEN_ADDRESS | address in 0x format | Address of zrc2 contract |
| TOTAL_TOKENS_TO_TRANSFER | number value of tokens to transfer | Just refer to how it is used in Reward.js and change it as needed. |

### Running the script
Install dependencies <br>
```
npm install
```

Running the script <br>
```
node ./DistributeRewards.js
```