// Update the path of .env path if needed
require('dotenv').config({ path: './.env' })

const { deployContract } = require('./utils/deploy.js')
const { getAddressFromPrivateKey } = require('@zilliqa-js/crypto')
const util = require('util')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)

async function deployRewardsContract(
  privateKey,
  ownerAddress,
  tokenAddress,
  transferFromAddress,
  maxLimit
) {
  // Check for key
  if (!privateKey || privateKey === '') {
    throw new Error('No private key was provided!')
  }

  const address = getAddressFromPrivateKey(privateKey)

  const code = (
    await readFile(process.env.CONTRACTS_DIR + '/' + 'LCReward.scilla')
  ).toString()
  const init = [
    {
      vname: '_scilla_version',
      type: 'Uint32',
      value: '0'
    }
  ]

  console.info('Deploying LCReward Contract...')
  return deployContract(privateKey, address, code, init)
}

exports.deployRewardsContract = deployRewardsContract
