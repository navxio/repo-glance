// WIP
import storage from "~storage"

const STORAGE_KEY: string = 'com.github.navxio.repo_glance.blacklist'

const addToBlacklist = async (domain: string) => {
  if (!domain) return false
  let BLACKLIST: [string]
  try {
    BLACKLIST = await storage.get(STORAGE_KEY)

  } catch (e) {
    console.error('error with storage', e)
    return false
  }
  if (BLACKLIST.indexOf(domain.trim()) !== -1) return false

  BLACKLIST.push(domain.trim())

  try {
    await storage.set(STORAGE_KEY, BLACKLIST)
  } catch (e) {
    console.error('error with storage', e)
  }

  return true
}

const removeFromBlacklist = async (domain: string) => {
  if (!domain) return false

  let BLACKLIST: [string]

  try {
    BLACKLIST = await storage.get(STORAGE_KEY)

  } catch (e) {
    console.error('error with storage', e)
    return false
  }
  if (BLACKLIST.indexOf(domain.trim()) !== -1) return false

  // remove it
  const i: number = BLACKLIST.indexOf(domain.trim())
  BLACKLIST.pop(i)

  try {
    await storage.set(STORAGE_KEY, BLACKLIST)
  } catch (e) {
    console.error('error with storage', e)
    return false
  }

  return true

}

const inBlacklist = async (domain: string) => {

  let BLACKLIST: [string]

  try {
    BLACKLIST = await storage.get(STORAGE_KEY)

  } catch (e) {
    console.error('error with storage', e)
    return false
  }
  return BLACKLIST.indexOf('domain') !== -1
}

const util = {
  inBlacklist, removeFromBlacklist, addToBlacklist
}

export default util
