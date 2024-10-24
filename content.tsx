import React, { useEffect, useState } from "react"

const githubRegex: RegExp =
  /https:\/\/github\.com\/(?!topics|collections|features|explore|issues|pulls|marketplace|settings|apps|events|sponsors|about|search|notifications|organizations|enterprise|stars|gists|readme|users|security|contact|solutions)([A-Za-z0-9-]+)\/([A-Za-z0-9-_]+)(\/[^?]*)?(\?.*)?$/

// export this component
export const RepoMetadataExtension = () => {
  const [popup, setPopup] = useState(null)

  function hidePopup() {
    popup.style.visibility = "hidden"
  }

  async function fetchMetadataShowPopup(event, owner: string, name: string) {
    const { default: Popup } = await import("./RepoMetaPopupUI")
    ReactDOM.render(<Popup owner={owner} name={name} />, popup)
  }

  useEffect(() => {
    const popup = document.createElement("div")
    document.body.appendChild(popup)
    setPopup(popup)
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
  }, [])

  return <></>
}
