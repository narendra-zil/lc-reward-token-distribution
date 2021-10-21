require('dotenv').config({ path: './.env' })

const { deployRewardsContract } = require('../scripts/DeployRewards.js')
const { deployFungibleToken } = require('../scripts/DeployToken.js')
const { batchTransfer } = require('../scripts/RewardsBatchTransfer.js')
const { getAddressFromPrivateKey } = require('@zilliqa-js/crypto')
const crypto = require('@zilliqa-js/crypto')
const { BN } = require('@zilliqa-js/util')
const { useFungibleToken } = require('../scripts/utils/call.js')
const {
  setupBalancesOnAccounts,
  clearBalancesOnAccounts,
  sendFTTo
} = require('../scripts/utils/call.js')

beforeEach(async () => {
  await setupBalancesOnAccounts()
})

afterEach(async () => {
  await clearBalancesOnAccounts()
})

async function setup() {
  // Deploy Fungible Token(xcad_cc)

  const fungibleTokenDeployParams = {
    name: 'LUNR Token',
    symbol: null,
    decimals: 4,
    supply: new BN('2500000000000'),
    dexCheck: 'True'
  }
  // it works
  const [token] = await deployFungibleToken(
    process.env.MASTER_PRIVATE_KEY,
    fungibleTokenDeployParams,
    getAddressFromPrivateKey(process.env.TOKEN_OWNER_PRIVATE_KEY)
  )
  console.log(`token address : ${token.address}`)
  /*
  // faced some issue with deploy function so i used ide.zilliqa.com for deployment. will fix this soon.
  const rewardsContract = await deployRewardsContract(
    process.env.MASTER_PRIVATE_KEY,
    getAddressFromPrivateKey(process.env.REWARD_OWNER_PRIVATE_KEY),
    '0x5c4B7cdDCD05dC56232e4587fe1d7867dfeeeC24,',
    getAddressFromPrivateKey(process.env.REWARD_OWNER_PRIVATE_KEY),
    '10000000'
  )
*/
  // const rewardsContract = await deployTest(process.env.MASTER_PRIVATE_KEY)

  return [token.address, 'dummy']
}

test('Rewards Batch transfer test', async () => {
  //const [tokenAddress, rewardContractAddress] = await setup()
  // after deployment setup init params.
  const [tokenAddress, rewardContractAddress] = [
    '0x9190ad5e1ea1864178a0cbb697b8e8cd12fb1591',
    '0x1e74f8d71d186f59cb7e0a240ad0924255921e81'
  ]
  console.log(
    `Token Address : ${tokenAddress}, rewardContractAddress : ${rewardContractAddress}`
  )
  expect(tokenAddress).toBeDefined()
  expect(rewardContractAddress).toBeDefined()

  const token = await useFungibleToken(
    process.env.TOKEN_OWNER_PRIVATE_KEY,
    tokenAddress
  )

  //Send token to reward contract so that it can send to respective users who are claiming rewards.
  const sendTokensTxn = await sendFTTo(
    process.env.TOKEN_OWNER_PRIVATE_KEY,
    token,
    String(1000),
    rewardContractAddress
  )

  console.log(`sendToken txid : ${sendTokensTxn.id}`)
  expect(sendTokensTxn.receipt.success).toEqual(true)

  const pk1 = crypto.schnorr.generatePrivateKey()
  const pk2 = crypto.schnorr.generatePrivateKey()
  const pk3 = crypto.schnorr.generatePrivateKey()

  const toList = []
  toList.push({
    constructor: 'Pair',
    argtypes: ['ByStr20', 'Uint128'],
    arguments: [getAddressFromPrivateKey(pk1), '1']
  })
  toList.push({
    constructor: 'Pair',
    argtypes: ['ByStr20', 'Uint128'],
    arguments: [getAddressFromPrivateKey(pk2), '2']
  })
  toList.push({
    constructor: 'Pair',
    argtypes: ['ByStr20', 'Uint128'],
    arguments: [getAddressFromPrivateKey(pk3), '3']
  })
  const batchTxn = await batchTransfer(
    process.env.REWARD_OWNER_PRIVATE_KEY,
    rewardContractAddress,
    toList
  )
  console.log(`batchTxnId ${batchTxn.id}`)
  expect(batchTxn.receipt.success).toEqual(true)
})
