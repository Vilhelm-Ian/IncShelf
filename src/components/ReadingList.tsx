import { useState } from "preact/hooks";
import { open } from '@tauri-apps/api/dialog';
import get_file_name from "../utils/get_file_name";
// Open a selection dialog for image files

function ReadingList() {
  async function add_document() {
    const path = await open({
      multiple: false,
      filters: [{
        name: 'Document',
        extensions: ['pdf']
      }]
    });
    console.log(path)
    if (Array.isArray(path) || path === null) {
      return Promise.reject("Selected multiple files or none")
    }
    let file = await get_file_name(path)
    console.log(file)
  }

  return (
    <div>
    <button onclick= { add_document } > Add < /button>
    < /div>
  );
}

export default ReadingList;

