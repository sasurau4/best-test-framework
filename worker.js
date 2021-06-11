const fs = require('fs')

exports.runTest = async function (testFile) {
    const code = await fs.promises.readFile(testFile, 'utf8')

    return `worker id: ${process.env.JEST_WORKER_ID}\nfile: ${testFile}:\n${code}`
    return testFile + ':\n' + code
}