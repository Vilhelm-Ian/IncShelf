import { useState, useEffect } from 'preact/hooks'
import './app.css'
import { open } from '@tauri-apps/api/dialog';
import { openDB, deleteDB, wrap, unwrap } from 'idb';
import get_file_name from "./utils/get_file_name"
import { DB } from './app'
import { useContext } from 'preact/hooks'
import { signal } from '@preact/signals';

let file = signal({
  file_path: signal(""),
  file_name: signal(""),
  priority: signal(NaN)
})
let priority_que = signal([])

export function AddDocumentDialog(props) {
  let [tags, setTags] = useState([])
  let [priority, setPriority] = useState(0)
  const [books, setBooks] = useContext(DB)


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
    file.value.file_path.value = selected
    file.value.priority.value = 0
    file.value.file_name.value = await get_file_name(file.value.file_path.value)
    priority_que.value = [...books].sort((a, b) => a.priority - b.priority)
  }

  function add_tags(e) {
    setTags(e.target.value.split(" "))
  }

  function increment_priority(increment) {
    file.value.priority.value += increment
  }

  function update_priority(e) {
    console.log("updating")
    let value = e.target.value
    if (Number.isNaN(Number(value)) || value < 0 || value > books.length || value === "") {
      if (value === "") return
      e.target.value = Number(file.value.priority)
      return
    }
    console.log("new")
    console.log(Number(e.target.value))
    file.value.priority.value = Number(value)

  }
  //WANT TO IN THE FUTURE TO USE INDEXDDB
  async function add_to_db() {
    setBooks((old_books)=>{
      let new_books = [...old_books]
      new_books.push({ name: file.value.file_name.value, file_path: file.value.file_path.value, priority: file.value.priority.value, tags, due_date: Date.now(), interval: 0 })
      return new_books
    })
    document.getElementById("add_document_dialog").close()
  }

  function render_priority_list() {
    let sorted_que = [...books].sort((a, b) => a.priority - b.priority)
    if(!Number.isNaN(file.value.priority.value)) {
      sorted_que.splice(file.value.priority.value, 0, { name: file.value.file_name.value })
    }
    return sorted_que.map((element, index) => <li key={element.name} style={index === file.value.priority.value ? "border: solid 1px red;" : "border: solid 1px black"}>{element.name}</li>)
  }


  return (
    <dialog id="add_document_dialog">
      <button onClick={add_file_path}>File</button>
      <p>file path: {file.value.file_path.value}</p>
      <input onChange={(e) => file.value.file_path.value = e.target.value} value={file.value.file_path.value} />
      <label>Tags</label>
      <input onChange={add_tags}></input>
      <label>Priority</label>
      <button onClick={add_to_db}>Add</button>
      <div style="display: flex; flex-direction: cloumn;">
        <ol class="priority_list">
          {
          render_priority_list()
        }
        </ol>
        <div>
          {
          !Number.isNaN(file.value.priority.value) ? 
          <div>
          <input onInput={update_priority} value={file.value.priority.value} max={books.length} />
          <button style={file.value.priority.value >= books.length ? "display: none" : ""} onClick={() => increment_priority(1)}>up</button>
          <button style={file.value.priority.value === 0 ? "display: none" : ""} onClick={() => increment_priority(-1)}>Down</button>
          </div>
        :
        <>
          </>
        }
        </div>
      </div>
    </dialog>
  )
}
