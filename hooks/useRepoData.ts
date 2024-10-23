import { ApolloClient, gql, HttpLink, InMemoryCache } from "@apollo/client"
import { useQuery } from "@tanstack/react-query"

import useOAuth from "./useOAuth"

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

// Fetch repository details using Apollo Client with dynamic Authorization
const fetchRepoDetails = async ({ queryKey }: any) => {
  const [_key, { owner, name }] = queryKey

  // Get accessToken dynamically from the custom hook
  const { accessToken, refreshAccessToken } = useOAuth()

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

// React Query hook to use in a component
export const useRepositoryDetails = (owner: string, name: string) => {
  return useQuery(["repoDetails", { owner, name }], fetchRepoDetails, {
    staleTime: 60000, // Adjust cache time as needed
    cacheTime: 300000
  })
}
