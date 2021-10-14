const fs = require('fs')
const { getContractState } = require('./call.js')

async function captureSnapshot(privateKey, tokenAddress, file) {
  const state = await getContractState(privateKey, tokenAddress)
  const jsonString = JSON.stringify(state, null, '\t')
  fs.writeFile(file, jsonString, (err) => {
    if (err) {
      console.log('Error writing snapshot file', err)
    } else {
      console.log('Successfully created snapshot file')
    }
  })
}

exports.captureSnapshot = captureSnapshot
