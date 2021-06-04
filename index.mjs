import JestHasteMap from 'jest-haste-map'
import {cpus} from 'os'
import {dirname} from 'path'
import {fileURLToPath} from 'url'
import glob from 'glob'

const root = dirname(fileURLToPath(import.meta.url))

const hasteMap = new JestHasteMap.default({
    extensions: ['js'],
    maxWorkers: cpus().length,
    name: 'best-test-framework',
    platforms: [],
    rootDir: root,
    roots: [root],
})

const {hasteFS} = await hasteMap.build()
const testFiles = hasteFS.matchFilesWithGlob(['**/*.test.js'])

console.log(testFiles)