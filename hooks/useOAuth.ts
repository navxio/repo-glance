import { useCallback, useEffect, useState } from "react"

const useOAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)

  // On mount, load tokens from storage
  useEffect(() => {
    const populateTokens = async () => {
      let results: [string, string]
      try {
        results = await Promise.all([
          await store.get("accessToken"),
          await store.get("refreshToken")
        ])
        setAccessToken(results[0])
        setRefreshToken(results[1])
      } catch (e) {
        console.error("Error fetching tokens")
      }
    }
    populateTokens()
  }, [])

  // Helper function to store tokens
  const storeTokens = async (
    newAccessToken: string,
    newRefreshToken: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number
  ) => {
    const accessTokenExpiryTime = Date.now() + accessTokenExpiresIn * 1000 // Expires in seconds
    const refreshTokenExpiryTime = Date.now() + refreshTokenExpiresIn * 1000

    const storeAccessTokenPromise = store.set(
      "accessToken",
      newAccessToken,
      accessTokenExpiryTime
    )
    const storeRefreshTokenPromise = store.set(
      "refreshToken",
      newRefreshToken,
      refreshTokenExpiryTime
    )

    let results: [any, any] = []
    try {
      results = await Promise.all([
        storeAccessTokenPromise,
        storeRefreshTokenPromise
      ])
      return true
    } catch (e) {
      console.log(`Error storing auth tokens: ${e}`)
    }
  }

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) throw new Error("No refresh token available")

    const response = await fetch(
      "https://repo-glance.navdeep.io/refresh-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      }
    )

    const data = await response.json()
    if (data.access_token) {
      storeTokens(data.access_token, data.refresh_token, data.expires_in)
      return data.access_token
    } else {
      throw new Error("Failed to refresh token")
    }
  }, [refreshToken])

  return {
    accessToken,
    refreshAccessToken
  }
}

export default useOAuth
