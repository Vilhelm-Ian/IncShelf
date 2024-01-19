import { platform } from "@tauri-apps/api/os"

async function getFileName(path) {
	const platformName = await platform()
	let regex
	if (platformName === "win32") {
		regex = /[^\\]*\.pdf/
	} else {
		regex = /[^/]*\.pdf/
	}
	const fileName = path.match(regex)
	if (fileName === null) {
		return Promise.reject(Error("Couldn't find pdf file in path"))
	}
	return fileName[0]
}

export default getFileName
