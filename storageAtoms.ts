import type { Atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export const hoverDelayAtom = atomWithStorage("hoverDelayMS", 1000)
export const accessTokenAtom: Atom<string> = atomWithStorage(
  "accessToken",
  null
)
export const refreshTokenAtom: Atom<string> = atomWithStorage(
  "refreshToken",
  null
)

export const accessTokenExpiresAt = atomWithStorage(
  "accessTokenExpiresAt",
  null
)

export const refreshTokeExpiresAt = atomWithStorage(
  "refreshTokenExpiresAt",
  null
)
