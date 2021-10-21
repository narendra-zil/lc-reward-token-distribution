require('dotenv').config({ path: './.env' })

const { TESTNET_VERSION, zilliqa, useKey } = require('./utils/zilliqa')
const { BN, Long, units } = require('@zilliqa-js/util')
const { getAddressFromPrivateKey } = require('@zilliqa-js/crypto')
const BigNumber = require('bignumber.js')
const { useRewardsContract } = require('./utils/call.js')

/*
const users = [
  {
    key: 'b6664c9bda78664486b67dcf066cd84eb34e530888eecaabad53b8b62c14022d',
    address: '0x68BF7aC32270A0A74B3CD004BA51Bd4fa665DE72'
  },
  {
    key: '3fa9c9a9b47a4ebd210f83538bcbfbcd1737c5672bba592103b5334cd9178da0',
    address: '0x363d7d33B76281Eee147Ebea779AfFCC1aCDD594'
  },
  {
    key: '8aa8d475ddb7e933542747dca683cbc0b527db7d9a4c9d6e5820210e73a907b5',
    address: '0x3845bF674B76e03C0e2F434eE0235ee36beFdA8f'
  },
  {
    key: 'b220c4600bbe127852992111c2ef831020b3ce2dfffa28c515af0dc6f7ff5e9c',
    address: '0x89234Ea4742675d2824a18A5C33E0635E58f43b3'
  }
]
*/

async function batchTransfer(privateKey, contractAddress, toList) {
  try {
    useKey(privateKey)
    const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice()

    const contract = await useRewardsContract(privateKey, contractAddress)
    const tx = await contract.call(
      'BatchRewardsTransfer',
      [
        {
          vname: 'to_list',
          type: 'List (Pair (ByStr20) (Uint128))',
          value: toList
        }
      ],
      {
        // amount, gasPrice and gasLimit must be explicitly provided
        version: TESTNET_VERSION,
        amount: new BN(0),
        gasPrice: new BN(minGasPrice.result),
        gasLimit: Long.fromNumber(25000)
      }
    )

    // console.log(`tx reciept ${JSON.stringify(tx.receipt, null, 4)} `);
    return tx
  } catch (err) {
    console.log('Error while batch transfer :')
    console.log(err)
    return { status: false }
  }
}

exports.batchTransfer = batchTransfer
