import { useState, useEffect } from 'preact/hooks'
import getFileName from "./utils/get_file_name"
import { readBinaryFile } from '@tauri-apps/api/fs'
import { AddDocumentDialog } from "./add_document"
import { invoke } from '@tauri-apps/api'

export function FileList() {
  const [fileElements, setFileElemets] = useState([])
  const [files, setFiles] = useState([])
  const [display, setDisplay] = useState("visible")

  async function open_file(file_path, file_name) {
    try {
        // let data = await invoke('open_file_binary', { path: file_path })
        // Opening the file is slow in development because of serde
        //https://github.com/tauri-apps/tauri/issues/1817
        // To get around that I have to use invoke-http
      let data = await readBinaryFile(file_path)
      let f = new File([data], file_name, {
        type: "application/pdf"
      })
      document.documentViewer.openFile(f)
      setDisplay("none")
    }
    catch (err) {
      setDisplay("visible")
      console.log(err)
    }
  }


  useEffect(() => {
    let books = JSON.parse(localStorage.getItem("books"))
    if (books !== null) {
      setFiles(books)

    }
  }, [])

  useEffect(() => {
    create_rows()
  }, [files])


  function create_rows() {
    console.log(files)
    let rows = files.map(file => (
      <tr>
        <th ><input type="checkbox" /><span onClick={() => open_file(file.file_path, file.name)} >{file.name}</span></th>
        <th>1 day</th>
        <th><progress id="file" max="100" value={file.priority}></progress></th>
        <th>{file.tags}</th>
      </tr>
    ))
    setFileElemets(rows)
  }


  function show_dialog() {
    document.getElementById("add_document_dialog").showModal()
  }

  return (
    <div style={`display: ${display}`}>
      <button onClick={() => show_dialog()}>Add</button>
      <AddDocumentDialog setFiles={setFiles} />
      <p>Files</p>
      <table>
        <tr>
          <th>Title</th>
          <th>Added</th>
          <th>Progress</th>
          <th>Tags</th>
        </tr>
        {fileElements}
      </table>
    </div>
  )
}
