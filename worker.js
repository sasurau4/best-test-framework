const fs = require('fs')
const expect = require('expect')
const mock = require('jest-mock')
const { describe, it, run, resetState, getState } = require('jest-circus')

exports.runTest = async function (testFile) {
  const code = await fs.promises.readFile(testFile, 'utf8')
  let testResult = {
    success: false,
    errorMessage: null,
  }
  try {
    resetState()
    eval(code)
    const { testResults, unhandledErrors } = await run()
    testResult.testResults = testResults
    testResult.success =
      testResults.every((r) => !r.errors.length) && unhandledErrors.length === 0
  } catch (error) {
    testResult.errorMessage = error.message
  }
  return testResult
}
