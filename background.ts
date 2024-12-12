import { authorizeGithub, fetchRepoDetails } from "~gh.util"
import storage from "~storage"

const STORAGE_KEY: string = 'com.github.navxio.repo_glance.blacklist'

/* EVENT LISTENERS */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {

    storage.set(STORAGE_KEY, [])
    authorizeGithub()
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "REFRESH_REPO_CACHE") {
    const { owner, name } = message

    // Fetch latest data from GitHub
    fetchRepoDetails({ owner, name })
      .then((newData) => {
        // Update localStorage with fresh data and new timestamp
        return storage.set(owner + "-" + name, newData)
        // Optionally, send response back to content script
      })
      .then(() => {
        return storage.set(
          owner + "-" + name + "-" + "expiry",
          Date.now() + 3600 * 1000
        )
      })
      .then((_) => {
        sendResponse({ success: true })
        // Return true to keep the message channel open
        return true
      })
      .catch((e) => {
        console.error(`Error refreshing repo data ${owner + "/" + name}: ${e}`)
        sendResponse({ success: false })
      })
  }
})
