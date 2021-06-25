import JestHasteMap from 'jest-haste-map'
import { cpus } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { runTest } from './worker.js'
import { Worker } from 'jest-worker'
import chalk from 'chalk'
import { relative } from 'path'

const root = dirname(fileURLToPath(import.meta.url))

const hasteMap = new JestHasteMap.default({
  extensions: ['js'],
  maxWorkers: cpus().length,
  name: 'best-test-framework',
  platforms: [],
  rootDir: root,
  roots: [root],
})

const { hasteFS } = await hasteMap.build()
const worker = new Worker(join(root, 'worker.js'), {
  enableWorkerThreads: false,
})

const testFiles = hasteFS.matchFilesWithGlob([
  process.argv[2] ? `**/${process.argv[2]}*` : '**/*.test.js',
])

let hasFailed = false
await Promise.all(
  Array.from(testFiles).map(async (testFile) => {
    const { success, errorMessage, testResults } = await worker.runTest(
      testFile,
    )
    const status = success
      ? chalk.green.inverse.bold(' PASS ')
      : chalk.red.inverse.bold(' FAIL ')
    console.log(`${status} ${chalk.dim(relative(root, testFile))}`)
    if (!success) {
      hasFailed = true
      if (testResults) {
        testResults
          .filter((result) => result.errors.length)
          .forEach((result) => {
            console.log(
              result.testPath.slice(1).join(' ') + '\n' + result.errors[0],
            )
          })
      } else if (errorMessage) {
        console.log(`  ${errorMessage}`)
      }
    }
  }),
)

worker.end()

if (hasFailed) {
  console.log(
    '\n' + chalk.red.bold('Test run failed, please fix all the failing tests.'),
  )

  process.exitCode = 1
}
