import { join, resolve, extname, basename } from 'path'
import { readdirSync } from 'fs'
import { distanceBetween } from '../utils/string'

const DATA_DIR = resolve(__dirname, '../../data/libraries')

const LIBRARY_NAMES = readdirSync(DATA_DIR)
  .filter(file => extname(file) === '.json')
  .map(file => basename(file, '.json'))

const aliasMap = {}
const libraries = {}

for (const libraryName of LIBRARY_NAMES) {
  try {
    const library = require(join(DATA_DIR, `${libraryName}.json`))
    libraries[libraryName.toLowerCase()] = _validateLibrary(library)
  } catch (error) {
    console.warn(
      `[LibraryService] Something went wrong when requiring or validating "${libraryName}.json":`
    )
    console.error(error)
  }
}

for (const library of Object.values(libraries)) {
  for (const alias of library.aliases) {
    aliasMap[alias.toLowerCase()] = library.name.toLowerCase()
  }
}

export default libraries

/**
 * @typedef {Object} LibraryDefinition
 * @property {string} name The name of the library.
 * @property {string} [icon] An optional icon path.
 * @property {Array<string>} [tags=[]] An array of tags.
 * @property {string} tagline The library's tagline or description.
 * @property {Array<{name: string, value: string}>} fields An array of field objects.
 * @property {{name: string, url: string, avatar: string}} [author] The author of the library.
 * @property {{site: string, docs: string, repo: string, bugs: string}} url Various URLs relating to the library.
 */

/**
 * Return a library.
 *
 * @param {string} name The name of the library.
 * @returns {LibraryDefinition} The library object.
 */
export function getLibrary(name) {
  name = name.toLowerCase()

  if (libraries[name]) {
    return libraries[name]
  }

  if (aliasMap[name]) {
    return libraries[aliasMap[name]]
  }

  throw new Error(`[LibraryService] Could not find library: ${name}`)
}

/**
 * Find potentially matching libraries using the Levenshtein distance algorithm.
 *
 * @param {string} name The library name to match against.
 * @returns {LibraryDefinition[]} The matching libraries.
 */
export function findPossibleMatches(name) {
  const threshold = 0.5

  return Object.entries(libraries).reduce((matches, [libraryName, library]) => {
    const distance = distanceBetween(name, libraryName)

    if (distance >= threshold) {
      matches.push(library)
    }

    return matches
  }, [])
}

for (const library of Object.values(libraries)) {
  for (const alias of library.aliases) {
    aliasMap[alias] = library.name
  }
}

/**
 * Ensure that the structure of the JSON is as we expect it to be,
 * including required fields etc.
 *
 * @param {Object} library The parsed library JSON file.
 * @returns {LibraryDefinition} The validated library object.
 * @throws If certain fields are missing or of the wrong type.
 */
function _validateLibrary(library) {
  if (typeof library !== 'object') {
    throw new TypeError('Object expected')
  }

  if (typeof library.name === 'undefined') {
    throw new Error('Field "name" required')
  }

  if (typeof library.fields !== 'undefined' && !Array.isArray(library.fields)) {
    throw new TypeError('Field "fields", if present, must be of type "Array"')
  }

  if (!Array.isArray(library.topics)) {
    library.topics = []
  }

  if (typeof library.colour === 'undefined') {
    library.colour = 'RANDOM'
  }

  return library
}