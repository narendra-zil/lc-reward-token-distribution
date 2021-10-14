require('dotenv').config({ path: './.env' })

const { check } = require('./scripts/utils/SetupCheck.js')
const { clean } = require('./scripts/utils/Cleanup.js')
const { captureSnapshot } = require('./scripts/utils/Snapshot.js')
const { verifyRewardsDistribution } = require('./scripts/utils/Verify.js')
const { distributeTokens } = require('./scripts/utils/Reward.js')

;(async () => {
  try {
    await clean()
    const isEnvOk = await check()

    if (!isEnvOk) {
      console.log(`Please check if environment variables are set.`)
      return
    }

    // Take snapshot of current token state before distributing rewards
    await captureSnapshot(
      process.env.TOKEN_OWNER_PRIVATE_KEY,
      process.env.TOKEN_ADDRESS,
      './token.snapshot.old.json'
    )

    //wait for file to be created for few seconds
    await new Promise((r) => setTimeout(r, 5000))

    // Distribute tokens
    await distributeTokens()

    // Take snapshot of current token state after distributing rewards
    await captureSnapshot(
      process.env.TOKEN_OWNER_PRIVATE_KEY,
      process.env.TOKEN_ADDRESS,
      './scripts/token.snapshot.new.json'
    )

    // Verify rewards distribution
    await verifyRewardsDistribution()

    console.log('Rewards distributed successfully.')
  } catch (e) {
    console.log('Error encountered !!', e)
  }
})()
