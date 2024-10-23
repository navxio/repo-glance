import { useAtom } from "jotai"

import { hoverDelayAtom } from "~storageAtoms"
import { authenticateWithGitHub } from "~util"

const SetupInstall = () => {
  const [_] = useAtom(hoverDelayAtom)
}

/* EVENT LISTENERS */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("Extension installed")

    authenticateWithGitHub()
  }
})
