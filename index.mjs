import JestHasteMap from 'jest-haste-map'
import { cpus } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { runTest } from './worker.js'
import { Worker } from 'jest-worker'

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
    enableWorkerThreads: true,
})

const testFiles = hasteFS.matchFilesWithGlob(['**/*.test.js'])

await Promise.all(
  Array.from(testFiles).map(async (testFile) => {
      const testResult = await worker.runTest(testFile)
    console.log(testResult)
  }),
)

worker.end()
