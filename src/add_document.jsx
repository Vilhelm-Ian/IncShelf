import { useState, useEffect } from 'preact/hooks'
import './app.css'
import { open } from '@tauri-apps/api/dialog';
import { openDB, deleteDB, wrap, unwrap } from 'idb';
import get_file_name from "./utils/get_file_name"

export function AddDocumentDialog(props) {
  let [file_path, setFilePath] = useState("")
  let [tags, setTags] = useState([])
  let [priority, setPriority] = useState(0)
  // Open a selection dialog for image files
  async function add_file_path() {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Document',
        extensions: ['pdf']
      }]
    });
    if (Array.isArray(selected) || selected === null) {
      // user selected multiple files
      return
    }
    console.log(selected)
    setFilePath(selected)
  }

  function add_tags(e) {
    setTags(e.target.value.split(" "))
  }

  //WANT TO IN THE FUTURE TO USE INDEXDDX
  async function add_to_db() {
    let name = await get_file_name(file_path)
    let books = localStorage.getItem("books")
    if( books === null) {
      books = []
    } else {
      books = JSON.parse(books)
    }
    books.push({name, file_path, priority, tags})
    props.setFiles(books)
    localStorage.setItem("books", JSON.stringify(books))
    document.getElementById("add_document_dialog").close()
  }


  return (
    <dialog id="add_document_dialog">
      <button onClick={add_file_path}>File</button>
      <input onChange={(e) => setFilePath(e.target.value)} value={file_path} />
      <label>Tags</label>
      <input onChange={add_tags}></input>
      <label>Priority</label>
      <input onChange={(e) => setPriority(e.target.value)} type="range" min="1" max="100" />
      <button onClick={add_to_db}>Add</button>
    </dialog>
  )
}
