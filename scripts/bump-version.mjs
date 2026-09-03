import { readFile, writeFile } from "node:fs/promises"

const versionPath = new URL("../src/config/appVersion.js", import.meta.url)
const source = await readFile(versionPath, "utf8")
const match = source.match(/APP_VERSION\s*=\s*["'](\d+)\.(\d+)\.(\d+)["']/)

if (!match) {
  throw new Error("APP_VERSION must use major.minor.patch format")
}

const nextVersion = `${match[1]}.${match[2]}.${Number(match[3]) + 1}`
await writeFile(versionPath, `export const APP_VERSION = "${nextVersion}"\n`)
console.log(`Version bumped to ${nextVersion}`)
