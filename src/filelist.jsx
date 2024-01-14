import { useState, useEffect } from 'preact/hooks'
import getFileName from "./utils/get_file_name"
import { readBinaryFile } from '@tauri-apps/api/fs'
import { AddDocumentDialog } from "./add_document"
import { invoke } from '@tauri-apps/api'

export function FileList(props) {
  const [fileElements, setFileElemets] = useState([])
  const [display, setDisplay] = useState("visible")
  const [is_opening, setIsOpening] = useState(false)
  //TODO use react context provider to sync que

  function show_dialog() {
    document.getElementById("add_document_dialog").showModal()
  }
  // <AddDocumentDialog setFiles={setFiles} />

  async function open_next(async_callback) {
    setIsOpening(true)
    await async_callback()//props.open_next_in_que()
    setIsOpening(false)
  }

  return (
    <div>
      {
        is_opening ? <div class="loader"></div> :
          <div style={`display: ${display}`}>
            <button onClick={() => open_next(props.open_next_in_que)}>Next in que</button>
            <button onClick={() => show_dialog()}>Add</button>
            <p>Files</p>
            <table>
              <tr>
                <th>Title</th>
                <th>Added</th>
                <th>Progress</th>
                <th>Tags</th>
              </tr>
              {
                props.books.map(file => (
                  <tr>
                    <th ><input type="checkbox" /><span onClick={() => open_next(()=>props.open_file(file.file_path, file.name))} >{file.name}</span></th>
                    <th>1 day</th>
                    <th><progress id="file" max="100" value={file.priority}></progress></th>
                    <th>{file.tags}</th>
                  </tr>
                ))
              }
            </table>
          </div>
      }
    </div >
  )
}
