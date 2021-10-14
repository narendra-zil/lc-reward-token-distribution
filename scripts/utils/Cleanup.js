const fs = require('fs')
async function clean() {
  try {
    console.log(`Cleanup of previous snapshot files in progress.`)
    if (fs.existsSync('./token.snapshot.old.json')) {
      fs.unlink('./token.snapshot.old.json', () => {
        console.log('previous snapshot file deleted.')
      })
    }
    if (fs.existsSync('./token.snapshot.new.json')) {
      fs.unlink('./token.snapshot.new.json', () => {
        console.log('previous snapshot file deleted.')
      })
    }
  } catch (err) {
    console.log(`Error while cleanup ${err}`)
  }
}

exports.clean = clean
