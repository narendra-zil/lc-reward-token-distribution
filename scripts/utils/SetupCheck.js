async function check() {
  console.log(`Checking environment variables.`)

  const networkUrlExists =
    process.env.NETWORK_URL !== undefined &&
    String(process.env.NETWORK_URL).trim().length > 0

  const chainIdExists =
    process.env.CHAIN_ID !== undefined &&
    String(process.env.CHAIN_ID).trim().length > 0

  const tokenOwnerKeyExists =
    process.env.TOKEN_OWNER_PRIVATE_KEY !== undefined &&
    String(process.env.TOKEN_OWNER_PRIVATE_KEY).trim().length > 0

  const tokenAddressExists =
    process.env.TOKEN_ADDRESS !== undefined &&
    String(process.env.TOKEN_ADDRESS).trim().length > 0

  const totalNumberOfTokensToTransferExists =
    process.env.TOTAL_TOKENS_TO_TRANSFER !== undefined &&
    String(process.env.TOTAL_TOKENS_TO_TRANSFER).trim().length > 0

  return (
    networkUrlExists &&
    chainIdExists &&
    tokenOwnerKeyExists &&
    tokenAddressExists &&
    totalNumberOfTokensToTransferExists
  )
}

exports.check = check
