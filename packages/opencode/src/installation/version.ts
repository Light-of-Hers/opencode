declare global {
  const OPENCODE_VERSION: string
  const OPENCODE_BASE_VERSION: string
  const OPENCODE_CHANNEL: string
}

export const InstallationVersion =
  typeof OPENCODE_VERSION === "string" ? OPENCODE_VERSION : process.env.OPENCODE_VERSION || "local"
export const InstallationBaseVersion =
  typeof OPENCODE_BASE_VERSION === "string"
    ? OPENCODE_BASE_VERSION
    : process.env.OPENCODE_BASE_VERSION || InstallationVersion
export const InstallationChannel =
  typeof OPENCODE_CHANNEL === "string" ? OPENCODE_CHANNEL : process.env.OPENCODE_CHANNEL || "local"
export const InstallationLocal = InstallationChannel === "local"
export const InstallationDisplayVersion =
  InstallationChannel === "latest" ? `v${InstallationBaseVersion}` : `v${InstallationBaseVersion} - ${InstallationChannel}`
