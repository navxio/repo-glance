import debounce from "lodash/debounce"
import React, { useEffect, useRef } from "react"
import { createRoot } from "react-dom/client.js"
import { inBlacklist, addToBlacklist, removeFromBlacklist } from "~blacklist.util"

import Popup from "./RepoMetaPopupUI"

const GITHUB_REGEX: RegExp =
  /https:\/\/github\.com\/(?!topics|collections|features|explore|issues|pulls|marketplace|settings|apps|events|sponsors|about|search|notifications|organizations|enterprise|stars|gists|readme|users|security|contact|solutions)([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)\/?([^?]*)?(\?.*)?$/;

// all event listeners
//
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'refreshPage') {
    window.location.reload()
  } else if (message.type === 'blacklistDomain') {
    const baseURL: string = window.location.origin + window.location.pathname
    addToBlacklist(baseURL).then(res => {
      console.log(`added baseurl ${baseURL} to blacklist`)
    }).catch(e => {
      console.error('error adding current baseurl to blacklist')
    })
  } else if (message.type === 'fetchDomain') {
    const baseURL: string = window.location.origin + window.location.pathname
    sendResponse({ baseURL })
  } else if (message.type === 'whitelistDomain') {
    const baseURL: string = window.location.origin + window.location.pathname
    removeFromBlacklist(baseURL).then(res => {
      console.log(`remove baseurl ${baseURL} from blacklist`)
    }).catch(e => {
      console.error('error removing baseurl host from blacklist')
    })
  }
})

// export this component
const RepoMetadataExtension = () => {
  const popupRootRef = useRef(null)
  const popupRef = useRef(null)

  function hidePopup() {
    if (popupRef.current) {
      popupRef.current.style.visibility = "hidden"
    }
  }



  async function fetchMetadataShowPopup(event, owner: string, name: string) {

    // Ensure popupRef.current is defined
    if (popupRef.current) {
      popupRef.current.style.visibility = "visible"
      popupRef.current.style.top = `${event.pageY + 10}px`
      popupRef.current.style.left = `${event.pageX + 10}px`

      // Render the Popup component
      if (popupRootRef.current) {
        // force re render
        popupRootRef.current.render(
          <Popup
            key={`${owner}-${name}-${Date.now()}`}
            owner={owner}
            name={name}
          />
        )
      }
    }
  }

  const debouncedFetchMetadataShowPopup = debounce(fetchMetadataShowPopup, 300)

  const conditionallyPrepareGHLinksAddPopup = async () => {
    const baseURL = window.location.origin + window.location.pathname

    const isBlacklisted: boolean | null = await inBlacklist(baseURL)

    if (isBlacklisted) return null

    if (!popupRef.current) {
      popupRef.current = document.createElement("div")
      popupRef.current.style.position = "absolute"
      popupRef.current.style.zIndex = "10000"
      popupRef.current.style.backgroundColor = "black"
      popupRef.current.style.borderRadius = "20px"
      popupRef.current.style.color = "white"
      popupRef.current.style.maxWidth = "400px";
      popupRef.current.style.display = 'flex';
      popupRef.current.style.visibility = "hidden" // Start hidden
      document.body.appendChild(popupRef.current)
    }

    // Initialize the React root only once
    if (!popupRootRef.current) {
      popupRootRef.current = createRoot(popupRef.current)
    }
    // add listeners to every gh link
    document.querySelectorAll("a").forEach((link) => {
      const matches = link.href.match(GITHUB_REGEX)
      if (matches && link.href.indexOf(window.location.href) === -1) {
        const owner = matches[1]
        const name = matches[2]
        link.addEventListener("mouseenter", async (event) => {
          debouncedFetchMetadataShowPopup(event, owner, name)
        })
        link.addEventListener("mouseleave", hidePopup)
      }
    })

  }

  useEffect(() => {

    conditionallyPrepareGHLinksAddPopup()

    return () => {
      // clean up
      document.body.removeChild(popupRef.current)
    }
  }, [])

  return null
}

export default RepoMetadataExtension
