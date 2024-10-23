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
      exchangeCodeForToken(code).then((data) => {
        console.log("exchanged code for data", data)
      })
    }
  )
}
