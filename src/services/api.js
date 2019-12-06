import { join } from 'path'
import { readFileSync, existsSync } from 'fs'
import HJSON from 'hjson'
import Fuse from 'fuse.js'
import { DATA_DIR } from '../utils/constants'

const API_DATA_FILE = join(DATA_DIR, 'api.hjson')

if (!existsSync(API_DATA_FILE)) {
  throw new Error('Data file "data/api.hjson" does not exist!')
}

let apiData

/*
  Parse HJSON.
*/
try {
  apiData = HJSON.parse(readFileSync(API_DATA_FILE, 'utf8'))
} catch (error) {
  console.error(error)
  throw new Error('Data file "data/api.hjson" is unparseable!')
}

const aliasMap = {}

export const apis = {}

/*
  Flatten data and build alias map.
*/
for (const category of apiData.categories) {
  for (const item of category.items) {
    if (!item.id) {
      item.id = item.title
    }

    apis[item.id] = Object.assign(item, {
      category: category.title,
    })

    if (item.aliases) {
      for (const alias of item.aliases) {
        aliasMap[alias.toLowerCase()] = item.id
      }
    }
  }
}

/*
  Fuzzy searcher instance.
*/
const fuse = new Fuse(Object.values(apis), {
  shouldSort: true,
  includeScore: true,
  threshold: 0.35, // TODO: Experiment more but this seems fairly good for now.
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['title', 'aliases'],
})

/**
 * Get an API by id or alias.
 *
 * @param {string} name Which API to look up, by id (or alias).
 * @returns {undefined|object} The API if found, or undefined.
 */
export function getAPI(id) {
  id = id.toLowerCase()

  if (apis[id]) {
    return apis[id]
  }

  if (aliasMap[id]) {
    return apis[aliasMap[id]]
  }
}

/**
 * Find an API via fuzzy search.
 *
 * @param {string} search The string to search for in the title and through the aliases.
 * @returns {Array} Any API results that match the search string.
 */
export function findAPI(name) {
  const search = fuse.search(name)

  if (search.length > 0) {
    return search.map(({ item }) => item)
  }

  return []
}

export class APINotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'APINotFoundError'
  }
}
