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
      name
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
  if (accessTokenExpiry > Date.now()) {
    if (accessTokenExpiry - Date.now() < 30000) {
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
    if (refreshTokenExpiry < Date.now()) {
      // refresh token expired
      authenticateWithGitHub().then((data) => null)
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
    function (redirectUrl) {
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

      // Exchange the code for an access token
      exchangeCodeForToken(code)
        .then((data) => {
          console.log("exchanged code for data", data)
          return data
        })
        .catch((e) => {
          console.log("error exchanging code for accessToken", e)
        })
    }
  )
}

// Fetch repository details using Apollo Client with dynamic Authorization
export const fetchRepoDetails = async ({ owner, name }) => {
  // Get accessToken dynamically from the custom hook
  const { accessToken } = await getAccessToken()

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
