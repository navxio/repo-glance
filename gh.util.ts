import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client"

import storage from "~storage"

// create apollo client
const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.github.com/graphql"
  }),
  cache: new InMemoryCache()
})

// GraphQL query
const GET_REPOSITORY_DETAILS = gql`
  query GetRepositoryDetails($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      description
      stargazers {
        totalCount
      }
      issues(states: OPEN) {
        totalCount
      }
      pullRequests(states: OPEN) {
        totalCount
      }
      forks {
        totalCount
      }
    }
  }
`
/*
 *
 *
 *  checks the current cache for accesstoken and expiry time
 *  if not expired, returns it
 *  if about to expire, returns it but sends a message to background thread
 *  to refresh it
 *
 */
async function getAccessToken() {
  const accessToken = await storage.get("accessToken")
  const accessTokenExpiry = await storage.get("accessTokenExpiry")

  if (!accessTokenExpiry) return null
  const accessTokenExpiryTimestamp = parseInt(accessTokenExpiry)
  if (accessTokenExpiryTimestamp > Date.now()) {
    if (accessTokenExpiryTimestamp - Date.now() < 30000) {
      chrome.runtime.sendMessage({
        type: "REFRESH_ACCESS_TOKEN"
      })
    }
    return accessToken
  } else {
    // access token expired
    const refreshToken = await storage.get("refreshToken")
    const refreshTokenExpiry = await storage.get("refreshTokenExpiry")
    if (!refreshTokenExpiry) return null
    const refreshTokenExpiryTimestamp: number = parseInt(refreshTokenExpiry)
    if (refreshTokenExpiryTimestamp < Date.now()) {
      // refresh token expired
      authenticateWithGitHub()
    }
    const result = await refreshAccessToken(refreshToken)
    console.log("found result from refreshing token", result)
  }
}

const refreshAccessToken = async (refreshToken: string) => {
  const refreshTokenUrl = "https://repo-glance.navdeep.io/refresh-token"
  let backendResponse: any

  try {
    backendResponse = await fetch(refreshTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    })
    if (!backendResponse.ok) return null
    const data = await backendResponse.json()
    return data
  } catch (e) {
    console.error(`Error exchanging code for token ${e}`)
    return null
  }
}

async function exchangeCodeForToken(code: string) {
  const exchangeTokenUrl = "https://repo-glance.navdeep.io/exchange-github-code"

  let backendResponse: any

  try {
    backendResponse = await fetch(exchangeTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    })
    if (!backendResponse.ok) return null
    const data = await backendResponse.json()
    console.log(`found response for code: ${data}`)
    return data
  } catch (e) {
    console.error(`Error exchanging code for token ${e}`)
  }
}

export const authenticateWithGitHub = function authenticateWithGitHub() {
  const clientId: string = "Iv1.196bee9ccbc381ba" // Replace with your GitHub OAuth app client ID
  const redirectUri: string = chrome.identity.getRedirectURL()
  const authUrl: string = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true
    },
    async function (redirectUrl) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message)
        return
      }

      // Extract the authorization code from the redirect URL
      const code = new URL(redirectUrl).searchParams.get("code")
      if (!code) {
        console.error("No code found in redirect URL")
        return
      }
      console.log("gh code", code)

      let data: object = null
      try {
        data = await exchangeCodeForToken(code)
      } catch (e) {
        console.error(`Error exchange code for accessToken: ${e}`)
      }

      // store them tokens
      try {
        await storeAuthToken(data["access_token"], data["expires_in"])
        await storeRefreshToken(
          data["refresh_token"],
          data["refresh_token_expires_in"]
        )
        console.info("stored the tokens")
      } catch (e) {
        console.error(`Error storing tokens: ${e}`)
      }
    }
  )
}

async function storeAuthToken(accessToken: string, expiresIn: number) {
  // expiresIn is in s
  await Promise.all([
    storage.set("accessToken", accessToken),
    storage.set("accessTokenExpiry", Date.now() + expiresIn * 1000)
  ])
}

async function storeRefreshToken(refreshToken: string, expiresIn: number) {
  await Promise.all([
    storage.set("refreshToken", refreshToken),
    storage.set("refreshTokenExpiry", Date.now() + expiresIn * 1000)
  ])
}

// Fetch repository details using Apollo Client with dynamic Authorization
const fetchRepoDetails = async ({ owner, name }) => {
  // Get accessToken dynamically from the custom hook
  const accessToken = await getAccessToken()

  if (!accessToken) {
    throw new Error("No access token available")
  }

  try {
    const { data } = await client.query({
      query: GET_REPOSITORY_DETAILS,
      variables: { owner, name },
      context: {
        headers: {
          Authorization: `Bearer ${accessToken}` // Dynamically adding the Authorization header
        }
      }
    })

    return data
  } catch (error) {
    throw new Error(`Error fetching repository details: ${error.message}`)
  }
}

export async function getRepoDetails(owner: string, name: string) {
  // tries the cache for ze repo and fetches it from api if not available
  const dataKey = `${owner}-${name}`
  const expiryKey = `${owner}-${name}-expiry`
  const expiryTimestampStr = await storage.get(expiryKey)
  console.log(`found expiry timestamp ${expiryTimestampStr}`)
  const expiryTimestamp = parseInt(expiryTimestampStr)
  if (!expiryTimestamp || Date.now() > expiryTimestamp) {
    const repoResponseData = await fetchRepoDetails({ owner, name })
    const repoDataRaw = repoResponseData["repository"]

    const repoData = {
      description: repoDataRaw["description"],
      stargazerCount: repoDataRaw["stargazers"]["totalCount"],
      prCount: repoDataRaw["pullRequests"]["totalCount"],
      issueCount: repoDataRaw["issues"]["totalCount"],
      forkCount: repoDataRaw["forks"]["totalCount"]
    }

    console.log(`Fetched repoData ${repoData}`)
    await storage.set(dataKey, repoData)
    await storage.set(expiryKey, Date.now() + 3600 * 1000)
    return repoData
  } else {
    const repoData = await storage.get(dataKey)
    console.log(`Found cached data ${repoData} `)
    chrome.runtime.sendMessage({ type: "REFRESH_REPO_CACHE", owner, name })
    return repoData
  }
}
