const fs = require('fs')
async function verifyRewardsDistribution() {
  try {
    console.log(`Reward distribution verification in progress.`)

    if (!fs.existsSync('./token.snapshot.new.json')) {
      return false
    }

    //TODO : write logic to verify token distribution

    return true
  } catch (err) {
    console.log(`Error while verifying token rewards distribution ${err}`)
  }
}

exports.verifyRewardsDistribution = verifyRewardsDistribution
