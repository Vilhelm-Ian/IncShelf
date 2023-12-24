import { platform } from '@tauri-apps/api/os';

async function get_file_name(path: string): Promise<string> {
  const platformName = await platform();
  let regex
  if (platformName === "win32") {
    regex = /[^\\]*\.pdf/
  }
  else {
    regex = /[^\/]*\.pdf/
  }
  let file_name = path.match(regex)
  if (file_name === null) {
    return Promise.reject("Couldn't find pdf file in path")
  }
  return file_name[0]
}

export default get_file_name
