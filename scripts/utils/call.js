const { TESTNET_VERSION, zilliqa, useKey } = require('./zilliqa')
const { BN, Long, units } = require('@zilliqa-js/util')
const { getAddressFromPrivateKey } = require('@zilliqa-js/crypto')
const BigNumber = require('bignumber.js')

const getContractState = async (privateKey, contractHash) => {
  useKey(privateKey)
  console.log('get contract at address : ', contractHash)
  const contract = await zilliqa.contracts.at(contractHash)
  const state = await contract.getState()
  console.log('state in getContrct ', state)
  return state
}

async function getBalance(address) {
  const balanceRes = await zilliqa.blockchain.getBalance(address)
  if (balanceRes && balanceRes.result && balanceRes.result.balance) {
    return balanceRes.result.balance
  }

  return 0
}

async function transfer(privateKey, toAddr, amount) {
  // Check for key
  if (!privateKey || privateKey === '') {
    throw new Error('No private key was provided!')
  }
  useKey(privateKey)

  const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice()

  return await zilliqa.blockchain.createTransaction(
    zilliqa.transactions.new(
      {
        version: TESTNET_VERSION,
        toAddr,
        amount: new BN(units.toQa(amount, units.Units.Zil)),
        gasPrice: new BN(minGasPrice.result),
        gasLimit: Long.fromNumber(1)
      },
      false
    )
  )
}

async function sendZil(privateKey, recipientAddress, sendingAmount, gasLimit) {
  let blockchainTxnId = null
  try {
    useKey(privateKey)
    const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice()

    let tx = zilliqa.transactions.new({
      version: TESTNET_VERSION,
      toAddr: recipientAddress,
      amount: units.toQa(sendingAmount, units.Units.Zil),
      gasPrice: new BN(minGasPrice.result),
      gasLimit: gasLimit
    })

    // Send a transaction to the network
    tx = await zilliqa.blockchain.createTransactionWithoutConfirm(tx)
    blockchainTxnId = tx.id
    console.log('The sendZil transaction id is:', tx.id)

    console.log('Waiting transaction be confirmed')
    return await tx.confirm(tx.id, 33, 2000)
  } catch (err) {
    console.log('sendZil error:')
    console.log(err)
    return { transactionId: blockchainTxnId, status: false }
  }
}

async function getState(privateKey, contract, token) {
  const userAddress = getAddressFromPrivateKey(privateKey)
  const cState = await contract.getState()
  const tState = await token.getState()
  const pool = cState.pools[token.address.toLowerCase()]
  const [x, y] = pool ? pool.arguments : [0, 0]

  const state = {
    product: new BigNumber(x).times(y),
    userZils: new BigNumber(
      (await zilliqa.blockchain.getBalance(userAddress)).result.balance
    ),
    userTokens: new BigNumber(await tState.balances[userAddress.toLowerCase()]),
    poolZils: new BigNumber(
      (await zilliqa.blockchain.getBalance(contract.address)).result.balance
    ),
    poolTokens: new BigNumber(
      await tState.balances[contract.address.toLowerCase()]
    )
  }

  console.log('state: ', JSON.stringify(state, null, 2))
  return state
}

exports.sendFTTo = async (privateKey, contract, amount, toAddr) => {
  try {
    useKey(privateKey)
    const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice()

    const tx = await contract.call(
      'Transfer',
      [
        {
          vname: 'to',
          type: 'ByStr20',
          value: toAddr
        },
        {
          vname: 'amount',
          type: 'Uint128',
          value: amount
        }
      ],
      {
        // amount, gasPrice and gasLimit must be explicitly provided
        version: TESTNET_VERSION,
        amount: new BN(0),
        gasPrice: new BN(minGasPrice.result),
        gasLimit: Long.fromNumber(10000)
      }
    )

    // console.log(`tx reciept ${JSON.stringify(tx.receipt, null, 4)} `);
    return { transactionId: tx.id, receipt: tx.receipt }
  } catch (err) {
    console.log('send fungible token error:')
    console.log(err)
    return { status: false }
  }
}

exports.sendFT = async (privateKey, contract, amount, fromAddr, toAddr) => {
  try {
    useKey(privateKey)
    const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice()

    const tx = await contract.call(
      'TransferFrom',
      [
        {
          vname: 'from',
          type: 'ByStr20',
          value: fromAddr
        },
        {
          vname: 'to',
          type: 'ByStr20',
          value: toAddr
        },
        {
          vname: 'amount',
          type: 'Uint128',
          value: amount
        }
      ],
      {
        // amount, gasPrice and gasLimit must be explicitly provided
        version: TESTNET_VERSION,
        amount: new BN(0),
        gasPrice: new BN(minGasPrice.result),
        gasLimit: Long.fromNumber(10000)
      }
    )

    console.log(`tx reciept ${JSON.stringify(tx.receipt, null, 4)} `)
    return { transactionId: tx.id, receipt: tx.receipt }
  } catch (err) {
    console.log('send fungible token error:')
    console.log(err)
    return { result: false }
  }
}

async function increaseAllowance(privateKey, contract, spenderAddr, amount) {
  try {
    useKey(privateKey)
    const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice()

    const tx = await contract.call(
      'IncreaseAllowance',
      [
        {
          vname: 'spender',
          type: 'ByStr20',
          value: spenderAddr
        },
        {
          vname: 'amount',
          type: 'Uint128',
          value: amount
        }
      ],
      {
        // amount, gasPrice and gasLimit must be explicitly provided
        version: TESTNET_VERSION,
        amount: new BN(0),
        gasPrice: new BN(minGasPrice.result),
        gasLimit: Long.fromNumber(10000)
      }
    )

    return tx
  } catch (err) {
    console.log('send fungible token error:')
    console.log(err)
    return { result: false }
  }
}

const getContract = async (privateKey, contractHash) => {
  useKey(privateKey)
  return await zilliqa.contracts.at(contractHash)
}

async function callContract(
  privateKey,
  contract,
  transition,
  args,
  zilsToSend = 0
) {
  // Check for key
  if (!privateKey || privateKey === '') {
    throw new Error('No private key was provided!')
  }
  useKey(privateKey)

  const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice()

  return await contract.call(
    transition,
    args,
    {
      version: TESTNET_VERSION,
      amount: units.toQa(zilsToSend, units.Units.Zil),
      gasPrice: new BN(minGasPrice.result),
      gasLimit: Long.fromNumber(25000)
    },
    33,
    1000,
    true
  )
}

const useFungibleToken = async (privateKey, tokenAddress) => {
  return await getContract(privateKey, tokenAddress)
}

const useRewardsContract = async (privateKey, contractAddress) => {
  return await getContract(privateKey, contractAddress)
}

async function setupBalancesOnAccounts() {
  let rewardOwnerBalance = await getBalance(
    getAddressFromPrivateKey(process.env.REWARD_OWNER_PRIVATE_KEY)
  )
  rewardOwnerBalance /= 1000000000000
  if (rewardOwnerBalance < 1000) {
    await sendZil(
      process.env.MASTER_PRIVATE_KEY,
      getAddressFromPrivateKey(process.env.REWARD_OWNER_PRIVATE_KEY),
      1000,
      Long.fromNumber(50)
    )
  }

  let tokenOwnerBalance = await getBalance(
    getAddressFromPrivateKey(process.env.TOKEN_OWNER_PRIVATE_KEY)
  )
  tokenOwnerBalance /= 1000000000000
  if (tokenOwnerBalance < 1000) {
    await sendZil(
      process.env.MASTER_PRIVATE_KEY,
      getAddressFromPrivateKey(process.env.TOKEN_OWNER_PRIVATE_KEY),
      1000,
      Long.fromNumber(50)
    )
  }
}

async function clearBalancesOnAccounts() {
  let rewardOwnerBalanceAfter = await getBalance(
    getAddressFromPrivateKey(process.env.REWARD_OWNER_PRIVATE_KEY)
  )
  rewardOwnerBalanceAfter /= 1000000000000
  if (rewardOwnerBalanceAfter > 1) {
    await sendZil(
      process.env.REWARD_OWNER_PRIVATE_KEY,
      getAddressFromPrivateKey(process.env.MASTER_PRIVATE_KEY),
      rewardOwnerBalanceAfter - 1,
      Long.fromNumber(50)
    )
  }

  let tokenOwnerBalanceAfter = await getBalance(
    getAddressFromPrivateKey(process.env.TOKEN_OWNER_PRIVATE_KEY)
  )
  tokenOwnerBalanceAfter /= 1000000000000
  if (tokenOwnerBalanceAfter > 1) {
    await sendZil(
      process.env.TOKEN_OWNER_PRIVATE_KEY,
      getAddressFromPrivateKey(process.env.MASTER_PRIVATE_KEY),
      tokenOwnerBalanceAfter - 1,
      Long.fromNumber(50)
    )
  }
}

exports.getContractState = getContractState
exports.increaseAllowance = increaseAllowance
exports.transfer = transfer
exports.getState = getState
exports.getBalance = getBalance
exports.sendZil = sendZil
exports.useFungibleToken = useFungibleToken
exports.useRewardsContract = useRewardsContract
exports.callContract = callContract
exports.setupBalancesOnAccounts = setupBalancesOnAccounts
exports.clearBalancesOnAccounts = clearBalancesOnAccounts
