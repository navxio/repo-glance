import CommitIcon from "@mui/icons-material/Commit"
import GitHubIcon from "@mui/icons-material/GitHub"
import StarBorderIcon from "@mui/icons-material/StarBorder"
import Box from "@mui/material/Box"
import { useAtom } from "jotai"
import React, { useEffect, useState } from "react"

import { hoverDelayAtom } from "~storageAtoms"

const githubRegex: RegExp =
  /https:\/\/github\.com\/(?!topics|collections|features|explore|issues|pulls|marketplace|settings|apps|events|sponsors|about|search|notifications|organizations|enterprise|stars|gists|readme|users|security|contact|solutions)([A-Za-z0-9-]+)\/([A-Za-z0-9-_]+)(\/[^?]*)?(\?.*)?$/

// export this component
export const RepoMetadata = () => {
  const [myTimeouts, setMyTimeouts] = useState([]) // will store all the timeouts
  const [hoverDelayMS] = useAtom(hoverDelayAtom)

  function hidePopup() {
    popup.style.visibility = "hidden"
    myTimeouts.forEach((myTimeout) => clearTimeout(myTimeout))
  }

  useEffect(() => {
    // add listeners to every gh link
    document.querySelectorAll("a").forEach((link) => {
      const matches = link.href.match(githubRegex)
      if (matches && link.href.indexOf(window.location.href) === -1) {
        const repoIdStr = matches[1] + "/" + matches[2]
        console.info(`found gh repo ${repoIdStr}`)
        link.addEventListener("mouseenter", (event) => {
          const myTimeout = setTimeout(() => {
            fetchMetadataShowPopup(event, repoIdStr)
          }, hoverDelayMS)
          setMyTimeouts([...myTimeouts, myTimeout])
        })
        link.addEventListener("mouseleave", hidePopup)
      }
    })
  }, [])

  return (
    <Box>
      <GitHubIcon />
    </Box>
  )
}
