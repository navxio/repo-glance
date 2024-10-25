import React, { useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client.js"

import Popup from "./RepoMetaPopupUI"

const githubRegex: RegExp =
  /https:\/\/github\.com\/(?!topics|collections|features|explore|issues|pulls|marketplace|settings|apps|events|sponsors|about|search|notifications|organizations|enterprise|stars|gists|readme|users|security|contact|solutions)([A-Za-z0-9-]+)\/([A-Za-z0-9-_]+)(\/[^?]*)?(\?.*)?$/

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
    console.log("fetchMetadataShowPopup invoked for:", owner, name)

    // Ensure popupRef.current is defined
    if (popupRef.current) {
      popupRef.current.style.visibility = "visible"
      popupRef.current.style.top = `${event.pageY}px`
      popupRef.current.style.left = `${event.pageX}px`

      // Render the Popup component
      if (popupRootRef.current) {
        popupRootRef.current.render(<Popup owner={owner} name={name} />)
      }
    }
  }

  useEffect(() => {
    if (!popupRef.current) {
      popupRef.current = document.createElement("div")
      popupRef.current.style.position = "absolute"
      popupRef.current.style.zIndex = "10000"
      popupRef.current.style.backgroundColor = "black"
      popupRef.current.style.borderRadius = "8px"
      popupRef.current.style.padding = "10px"
      popupRef.current.style.color = "white"
      popupRef.current.style.visibility = "hidden" // Start hidden
      document.body.appendChild(popupRef.current)
    }

    // Initialize the React root only once
    if (!popupRootRef.current) {
      popupRootRef.current = createRoot(popupRef.current)
    }
    // add listeners to every gh link
    document.querySelectorAll("a").forEach((link) => {
      const matches = link.href.match(githubRegex)
      if (matches && link.href.indexOf(window.location.href) === -1) {
        const owner = matches[1]
        const name = matches[2]
        link.addEventListener("mouseenter", async (event) => {
          await fetchMetadataShowPopup(event, owner, name)
        })
        link.addEventListener("mouseleave", hidePopup)
      }
    })

    return () => {
      // clean up
      document.body.removeChild(popupRef.current)
    }
  }, [])

  return null
}

export default RepoMetadataExtension
