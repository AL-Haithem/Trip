import { APP_VERSION } from "../config/appVersion.js"

export default function VersionBadge() {
  return <span className="app-version-badge">v{APP_VERSION}</span>
}
