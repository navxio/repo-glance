import type { PlasmoGetStyle } from "plasmo"
import React, { useEffect, useState } from "react"
import CommitIcon from "react:./svg/Commit.svg"
import ForkIcon from "react:./svg/Fork.svg"
import GHIcon from "react:./svg/GH.svg"
import IssueIcon from "react:./svg/Issue.svg"
import PRIcon from "react:./svg/PR.svg"
import StarIcon from "react:./svg/Star.svg"

import { fetchRepoDetails } from "~gh.util"
import storage from "~storage"

const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = `
    #popup-root {
      display: flex;
      border-radius: 20px;
      background-color: black;
      color: white;
    }
    .row {
    }
    .col {
    }
`
  return style
}

async function getRepoDetails(owner: string, name: string) {
  // tries the cache for ze repo and fetches it from api if not available
  const dataKey = `${owner}-${name}`
  const expiryKey = `${owner}-${name}-expiry`
  const expiryTimestampStr = await storage.get(expiryKey)
  const expiryTimestamp = parseInt(expiryTimestampStr)
  if (Date.now() > expiryTimestamp) {
    const repoData = await fetchRepoDetails({ owner, name })
    await storage.set(dataKey, repoData)
    await storage.set(expiryKey, Date.now() + 3600 * 1000)
    return repoData
  } else {
    const repoData = await storage.get(dataKey)
    chrome.runtime.sendMessage({ type: "REFRESH_REPO_CACHE", owner, name })
    return repoData
  }
}

const RepoMetaPopupUI = ({ owner, name }) => {
  const [repoData, setRepoData] = useState({})

  useEffect(() => {
    getRepoDetails(owner, name)
      .then((data) => setRepoData(data))
      .catch((e) => {
        console.error(`Error getting repo details ${e}`)
      })
  }, [])

  if (!repoData) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div id="popup-root">
        <div className="row">
          <div className="col">
            <GHIcon />
          </div>
          <div className="col">{owner + "/" + name}</div>
        </div>
        <div className="row">
          <div className="col">{repoData.description}</div>
        </div>
        <div className="row">
          <div className="col">
            <StarIcon />
          </div>
          <div className="col">{repoData.stargazerCount}</div>
        </div>
        <div className="row">
          <div className="col">
            <PRIcon />
          </div>
          <div className="col">{repoData.prCount}</div>
        </div>
        <div className="row">
          <div className="col">
            <IssueIcon />
          </div>
          <div className="col">{repoData.issueCount}</div>
        </div>
        <div className="row">
          <div className="col">
            <ForkIcon />
          </div>
          <div className="col">{repoData.forkCount}</div>
        </div>
        <div className="row">
          <div className="col">
            <CommitIcon />
          </div>
          <div className="col">{repoData.lastCommitTimestamp}</div>
        </div>
      </div>
    </>
  )
}

export default RepoMetaPopupUI
