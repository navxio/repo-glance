import React, { useEffect, useState } from "react"
import ForkIcon from "react:./svg/Fork.svg"
import GHIcon from "react:./svg/GH.svg"
import IssueIcon from "react:./svg/Issue.svg"
import PRIcon from "react:./svg/PR.svg"
import StarIcon from "react:./svg/Star.svg"

import { getRepoDetails } from "~gh.util"


const RepoMetaPopupUI = ({ owner, name }) => {
  const [repoData, setRepoData] = useState({})

  useEffect(() => {
    console.log("fetching repo details for:", owner, name)
    getRepoDetails(owner, name)
      .then((data) => {
        if ("repository" in data) {
          const repoDataRaw = data["repository"]

          const repoData = {
            description: repoDataRaw["description"],
            stargazerCount: repoDataRaw["stargazers"]["totalCount"],
            prCount: repoDataRaw["pullRequests"]["totalCount"],
            issueCount: repoDataRaw["issues"]["totalCount"],
            forkCount: repoDataRaw["forks"]["totalCount"]
          }
          setRepoData(repoData)
        } else {
          setRepoData(data)
        }
      })
      .catch((e) => {
        console.error(`Error getting repo details ${e}`)
      })
  }, [])

  useEffect(() => {
    console.log("found repoData", repoData)
  }, [repoData])
  if (!repoData) {
    return <div>Loading...</div>
  }

  return (
    <div className="popup">
      <div className="row">
        <div className="col icon">
          <GHIcon style={{ width: "48px", height: "48px" }} />
        </div>
        <div className="col">{owner + "/" + name}</div>
      </div>
      <div className="row">
        <div className="col icon">{repoData.description}</div>
      </div>
      <div className="row">
        <div className="col icon">
          <StarIcon style={{ width: "48px", height: "48px" }} />
        </div>
        <div className="col">{repoData.stargazerCount}</div>
      </div>
      <div className="row">
        <div className="col icon">
          <PRIcon style={{ width: "48px", height: "48px" }} />
        </div>
        <div className="col">{repoData.prCount}</div>
      </div>
      <div className="row">
        <div className="col icon">
          <IssueIcon style={{ width: "48px", height: "48px" }} />
        </div>
        <div className="col">{repoData.issueCount}</div>
      </div>
      <div className="row">
        <div className="col icon">
          <ForkIcon style={{ width: "48px", height: "48px" }} />
        </div>
        <div className="col">{repoData.forkCount}</div>
      </div>
    </div>
  )
}

export default RepoMetaPopupUI
