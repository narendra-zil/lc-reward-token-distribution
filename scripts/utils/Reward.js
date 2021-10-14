const fs = require('fs')
const filePath = './address-rewarded.json'
const { sendFTTo, useFungibleToken } = require('./call.js')
const { TransactionError } = require('@zilliqa-js/core')

async function createEmptyFile() {
  const obj = {}
  const json = JSON.stringify(obj, null, '\t')
  fs.writeFileSync(filePath, json, 'utf8')
}

async function addRewardedHolder(address, amount) {
  const data = fs.readFileSync(filePath, 'utf8')
  const obj = JSON.parse(data)
  obj[address] = amount
  const json = JSON.stringify(obj, null, '\t')
  fs.writeFileSync(filePath, json, 'utf8')
}

async function isAwardedBefore(address) {
  const data = fs.readFileSync(filePath, 'utf8')
  const obj = JSON.parse(data)
  return obj[address] !== undefined
}

async function distributeTokens() {
  try {
    const oldTokenSnapshot = require('../../token.snapshot.old.json')

    const tokenHolders = oldTokenSnapshot.balances
    if (!fs.existsSync(filePath)) {
      await createEmptyFile()
    }
    const holderAddresses = Object.keys(tokenHolders)

    for (const address of holderAddresses) {
      console.log(`address : ${address}, balance : ${tokenHolders[address]}`)
      const totalTokensToSend = process.env.TOTAL_TOKENS_TO_TRANSFER //replace it with actual number

      if (await isAwardedBefore(address)) {
        console.log(
          `holder with address : ${address} already received reward tokens.`
        )
      } else {
        console.log(`Send token rewards to holder with address : ${address}`)
        const contract = await useFungibleToken(
          process.env.TOKEN_OWNER_PRIVATE_KEY,
          process.env.TOKEN_ADDRESS
        )

        const sendTokensTxn = await sendFTTo(
          process.env.TOKEN_OWNER_PRIVATE_KEY,
          contract,
          String(totalTokensToSend),
          address
        )
        if (sendTokensTxn.receipt.success === true) {
          console.log(
            `total ${totalTokensToSend} tokens sent successfully to address ${address}`
          )
          await addRewardedHolder(address, tokenHolders[address])
        } else {
          console.log(
            `Transaction failed while sending tokens to address ${address}`
          )
          const errors = sendTokensTxn.receipt.errors

          console.log(JSON.stringify(sendTokensTxn.receipt.exceptions))

          const errMsgs = errors
            ? Object.keys(errors).reduce((acc, depth) => {
                const errorMsgList = errors[depth].map(
                  (num) => TransactionError[num]
                )
                return { ...acc, [depth]: errorMsgList }
              }, {})
            : 'Failed to transfer tokens tokens!'
          throw new Error(JSON.stringify(errMsgs, null, 2))
        }
      }
    }
  } catch (err) {
    console.log(`Error while sending rewards ${err}`)
  }
}

exports.distributeTokens = distributeTokens
