// Update the path of .env path if needed
require('dotenv').config({ path: './.env' })

const { Long } = require('@zilliqa-js/util')
const { getAddressFromPrivateKey } = require('@zilliqa-js/crypto')

const crypto = require('@zilliqa-js/crypto')

const { getBalance, sendZil } = require('./utils/call.js')

const sendZilToUser = async (privateKey, recipientAddress, sendingAmount) => {
  const gasLimit = Long.fromNumber(50)
  try {
    const res = await sendZil(
      privateKey,
      recipientAddress,
      sendingAmount,
      gasLimit
    )
    console.log('Response of sendZil => ', JSON.stringify(res))
    return res
  } catch (err) {
    console.log(err)
    console.log('Error while sending ZIL')
  }
}

;(async () => {
  try {
    /*(const masterAddress = getAddressFromPrivateKey(
      process.env.MASTER_PRIVATE_KEY
    )
    const masterBalance = await getBalance(masterAddress)
    console.log(`Master account balance : ${masterBalance}`)
      */
    // await sendZilToUser(
    //   process.env.GENESIS_PRIVATE_KEY,
    //   getAddressFromPrivateKey(process.env.MASTER_PRIVATE_KEY),
    //   50000
    // )
  } catch (e) {
    console.log('Error encountered !!', e)
  }
})()
