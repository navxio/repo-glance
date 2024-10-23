import Box from "@mui/material/Box"
import CommitIcon from "data-text:./svg/Commit.svg"
import ForkIcon from "data-text:./svg/Fork.svg"
import GHIcon from "data-text:./svg/GH.svg"
import IssueIcon from "data-text:./svg/Issue.svg"
import PRIcon from "data-text:./svg/PR.svg"
import StarIcon from "data-text:./svg/Star.svg"
import React from "react"

//TODO: styles
export const RepoMetaPopup = (
  repoIdStr: string,
  lastCommitTimestamp: string,
  stargazerCount: number,
  description: string,
  prCount: number,
  issueCount: number,
  forkCount: number
) => {
  return (
    <Box>
      <GHIcon />
      {repoIdStr}
      {description}
      <StarIcon /> {String(stargazerCount)}
      <PRIcon />
      {String(prCount)}
      <IssueIcon />
      {String(issueCount)}
      <ForkIcon />
      {String(forkCount)}
      <CommitIcon />
      {lastCommitTimestamp}
    </Box>
  )
}
