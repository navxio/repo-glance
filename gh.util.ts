import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client"

import storage from "~storage"


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

// create apollo client
const ghGraphClient = new ApolloClient({
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
 *
 */
async function getAccessToken() {
  const accessTokenExpiry: string = await storage.get('accessTokenExpiry')
  if (!accessTokenExpiry) {
    console.error('Access token expiry time string not found')
  }
  const accessTokenExpiryTime = parseInt(accessTokenExpiry)

  if (accessTokenExpiryTime > Date.now()) {
    // not expired
    const accessToken: string = await storage.get("accessToken")
    return accessToken
  } else {
    // expired
    const refreshTokenExpiry: string | null = await storage.get("refreshTokenExpiry")
    if (!refreshTokenExpiry) return null
    const refreshTokenExpiryTime: number = parseInt(refreshTokenExpiry)
    console.log(refreshTokenExpiryTime)

    if (refreshTokenExpiryTime < Date.now()) {
      // re -authorize
      authorizeGithub()
    } else {
      const refreshToken: string | null = await storage.get('refreshToken')
      if (!refreshToken) {
        authorizeGithub()
      }
      const result = await refreshAccessToken(refreshToken)
      // restore
      const storeAuthTokenPromise = storeAuthToken(result['access_token'], Date.now() + 1000 * parseInt(result['expires_in']))
      const storeRefreshTokenPromise = storeRefreshToken(result['refresh_token'], Date.now() + 1000 * parseInt(result['refresh_token_expires_in']))
      await Promise.all([storeAuthTokenPromise, storeRefreshTokenPromise])
      return result['access_token']
    }
  }

}

const refreshAccessToken = async (refreshToken: string) => {
  const refreshTokenUrl: string = "https://repo-glance.navdeep.io/refresh-token"
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

function monitorOAuthRedirect(tabId) {
  chrome.tabs.onUpdated.addListener(function listener(tabIdUpdated, changeInfo, tab) {
    if (tabIdUpdated === tabId && changeInfo.url) {
      const url = new URL(changeInfo.url);
      console.log('myUrl', url)

      // Check if the URL is the callback URL
      if (url.hostname === "repo-glance.navdeep.io" && url.pathname === "/oauth/end") {
        const token = url.searchParams.get("access_token");
        const expiresIn = parseInt(url.searchParams.get('expires_in'))
        const refreshToken = url.searchParams.get('refresh_token')
        const refreshTokenExpiresIn = parseInt(url.searchParams.get('refresh_token_expires_in'))

        if (token) {
          // Store the token securely
          // chrome.storage.local.set({ githubToken: token });
          Promise.all([storeAuthToken(token, expiresIn), storeRefreshToken(refreshToken, refreshTokenExpiresIn)]).then(resArr => {
            console.log('stored the tokens successfully~!')
          }).catch(e => {
            console.error('error storing tokens', e)
          })

          // Close the OAuth popup
          chrome.windows.remove(tab.windowId);

          // Stop listening for updates
          chrome.tabs.onUpdated.removeListener(listener);
        }
      }
    }
  });
}

export const authorizeGithub = function authorizeGithub() {

  const oauthUrl = "https://repo-glance.navdeep.io/oauth/start"
  chrome.windows.create({
    url: oauthUrl,
    type: 'popup',
    width: 500,
    height: 600,
  }, (window) => {
    const tabId = window.tabs[0].id
    monitorOAuthRedirect(tabId)
  });

}

// Fetch repository details using Apollo Client with dynamic Authorization
export const fetchRepoDetails = async ({ owner, name }) => {
  // Get accessToken dynamically from the custom hook
  const accessToken = await getAccessToken()

  if (!accessToken) {
    throw new Error("No access token available")
  }

  try {
    const { data } = await ghGraphClient.query({
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
    console.log(`Found cached data ${JSON.stringify(repoData)}`)
    chrome.runtime.sendMessage({ type: "REFRESH_REPO_CACHE", owner, name })
    return repoData
  }
}
