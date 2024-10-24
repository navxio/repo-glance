import type { PlasmoGetStyle } from "plasmo"
import React from "react"
import CommitIcon from "react:./svg/Commit.svg"
import ForkIcon from "react:./svg/Fork.svg"
import GHIcon from "react:./svg/GH.svg"
import IssueIcon from "react:./svg/Issue.svg"
import PRIcon from "react:./svg/PR.svg"
import StarIcon from "react:./svg/Star.svg"

export const getStyle: PlasmoGetStyle = () => {
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

export const RepoMetaPopupUI = ({
  repoIdStr,
  lastCommitTimestamp,
  stargazerCount,
  description,
  prCount,
  issueCount,
  forkCount
}) => {
  return (
    <>
      <div id="popup-root">
        <div className="row">
          <div className="col">
            <GHIcon />
          </div>
          <div className="col">{repoIdStr}</div>
        </div>
        <div className="row">
          <div className="col">{description}</div>
        </div>
        <div className="row">
          <div className="col">
            <StarIcon />
          </div>
          <div className="col">{stargazerCount}</div>
        </div>
        <div className="row">
          <div className="col">
            <PRIcon />
          </div>
          <div className="col">{prCount}</div>
        </div>
        <div className="row">
          <div className="col">
            <IssueIcon />
          </div>
          <div className="col">{issueCount}</div>
        </div>
        <div className="row">
          <div className="col">
            <ForkIcon />
          </div>
          <div className="col">{forkCount}</div>
        </div>
        <div className="row">
          <div className="col">
            <CommitIcon />
          </div>
          <div className="col">{lastCommitTimestamp}</div>
        </div>
      </div>
    </>
  )
}
