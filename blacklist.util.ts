// WIP
import storage from "~storage"

const STORAGE_KEY: string = 'com.github.navxio.repo_glance.blacklist'

export const addToBlacklist = async (domain: string): Promise<boolean | null> => {
  if (!domain) return false
  let BLACKLIST: [string]
  try {
    BLACKLIST = await storage.get(STORAGE_KEY)

  } catch (e) {
    console.error('error with storage', e)
    return null
  }
  if (BLACKLIST.indexOf(domain.trim()) !== -1) return false

  BLACKLIST.push(domain.trim())

  try {
    await storage.set(STORAGE_KEY, BLACKLIST)
  } catch (e) {
    console.error('error with storage', e)
    return null
  }

  return true
}

export const removeFromBlacklist = async (domain: string): Promise<boolean | null> => {
  if (!domain) return false

  let BLACKLIST: [string]

  try {
    BLACKLIST = await storage.get(STORAGE_KEY)

  } catch (e) {
    console.error('error with storage', e)
    return null
  }
  const i: number = BLACKLIST.indexOf(domain.trim())
  if (i === -1) return false // not found

  // remove it
  BLACKLIST.pop(i)

  try {
    await storage.set(STORAGE_KEY, BLACKLIST)
  } catch (e) {
    console.error('error with storage', e)
    return null
  }
  return true

}

export const inBlacklist = async (domain: string): Promise<boolean | null> => {
  // throw null if there's an error

  let BLACKLIST: [string]

  try {
    BLACKLIST = await storage.get(STORAGE_KEY)

  } catch (e) {
    console.error('error with storage', e)
    return null
  }
  return BLACKLIST.indexOf(domain.trim()) !== -1
}
