// WIP
import storage from "~storage"

const STORAGE_KEY: string = 'com.github.navxio.repo_glance.blacklist'

export const addToBlacklist = async (baseURL: string): Promise<[string] | null> => {
  if (!baseURL) return null
  let BLACKLIST: [string]
  try {
    BLACKLIST = await storage.get(STORAGE_KEY)
  } catch (e) {
    console.error('error with storage', e)
    return null
  }
  if (BLACKLIST.indexOf(baseURL.trim()) !== -1) return false

  BLACKLIST.push(baseURL.trim())

  try {
    await storage.set(STORAGE_KEY, BLACKLIST)
  } catch (e) {
    console.error('error with storage', e)
    return null
  }

  return BLACKLIST
}

export const removeFromBlacklist = async (baseURL: string): Promise<[string] | null> => {
  if (!baseURL) return null

  let BLACKLIST: [string]

  try {
    BLACKLIST = await storage.get(STORAGE_KEY)
  } catch (e) {
    console.error('error with storage', e)
    return null
  }
  const i: number = BLACKLIST.indexOf(baseURL.trim())
  if (i === -1) return null // not found

  // remove it
  BLACKLIST.pop(i)

  try {
    await storage.set(STORAGE_KEY, BLACKLIST)
  } catch (e) {
    console.error('error with storage', e)
    return null
  }
  return BLACKLIST

}

export const inBlacklist = async (baseURL: string): Promise<boolean | null> => {
  // throw null if there's an error

  let BLACKLIST: [string]

  try {
    BLACKLIST = await storage.get(STORAGE_KEY)

  } catch (e) {
    console.error('error with storage', e)
    return null
  }
  return BLACKLIST.indexOf(baseURL.trim()) !== -1
}
