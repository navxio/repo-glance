// WIP
import storage from "~storage"

// Initialize the blacklist
const BLACKLIST_KEY: string = "blacklist";

// Add a URL to the blacklist
export const addToBlacklist = async (url: string) => {
  const blacklist = (await storage.get(BLACKLIST_KEY)) || [];
  if (!blacklist.includes(url)) {
    blacklist.push(url);
    await storage.set(BLACKLIST_KEY, blacklist);
  }
  return blacklist
};

// Remove a URL from the blacklist
export const removeFromBlacklist = async (url: string) => {
  const blacklist = (await storage.get(BLACKLIST_KEY)) || [];
  const updatedBlacklist = blacklist.filter((item) => item !== url);
  await storage.set(BLACKLIST_KEY, updatedBlacklist);
  return blacklist
};

// Get the blacklist
export const getBlacklist = async (): Promise<string[]> => {
  return (await storage.get(BLACKLIST_KEY)) || [];
};

export const inBlacklist = async (baseURL: string): Promise<boolean | null> => {
  // throw null if there's an error

  let BLACKLIST: string[]

  try {
    BLACKLIST = await storage.get(BLACKLIST_KEY) || []
  } catch (e) {
    console.error('error with storage', e)
    return null
  }
  return BLACKLIST.indexOf(baseURL.trim()) !== -1
}
