import { useState, useEffect } from 'preact/hooks'
import './app.css'
import { open } from '@tauri-apps/api/dialog';
import { openDB, deleteDB, wrap, unwrap } from 'idb';
import get_file_name from "./utils/get_file_name"
import { DB } from './app'
import { useContext } from 'preact/hooks'
import { signal } from '@preact/signals';

let file = signal({
  file_path:signal(""),
  file_name:signal(""),
  priority: signal(0)
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
    file.value.file_name.value = await get_file_name(file.value.file_path.value)
    priority_que.value = [...books].sort((a,b)=>a.priority - b.priority)
  }

  function add_tags(e) {
    setTags(e.target.value.split(" "))
  }

  function increment_priority(increment) {
    file.value.priority.value  += increment 
  }

  function update_priority(e) {
    console.log("updating")
    let value  = e.target.value
    if(Number.isNaN(Number(value)) || value < 0 || value > books.length || value === "") {
      e.traget.value = file.value.priority.value
    console.log("the value should be:",e.target.value)
      return
    }
    console.log("new")
    console.log(e.target.value)
    file.value.priority.value = value
    
  }
  //WANT TO IN THE FUTURE TO USE INDEXDDX
  async function add_to_db() {
    let books = localStorage.getItem("books")
    if (books === null) {
      books = []
    } else {
      books = JSON.parse(books)
    }
    books.push({ name: file.value.file_name.value, file_path: file.value.file_path.value, priority: file.value.priority.value, tags, due_date: Date.now(), interval: 0 })
    setBooks(books)
    localStorage.setItem("books", JSON.stringify(books))
    document.getElementById("add_document_dialog").close()
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
      <div style={file.value.file_path.value === "" ? "display: none;" : "display: flex; flex-direction: cloumn;"}>
        <ol class="priority_list">
          {[...books].sort((a,b)=>a.priority-b.priority).toSpliced(file.value.priority.value,0,{name: file.value.file_name.value}).map((element,index) => <li style={index===file.value.priority.value ? "border: solid 1px red;" : "border: solid 1px black" }>{element.name}</li>)
        }
        </ol>
        <div>
          <input onInput={update_priority} value={file.value.priority.value} max={books.length} />
          <button style={file.value.priority.value >= books.length ? "display: none" : ""} onClick={()=>increment_priority(1)}>up</button>
          <button style={file.value.priority.value === 0 ? "display: none" : ""} onClick={()=>increment_priority(-1)}>Down</button>
        </div>
      </div>
    </dialog>
  )
}
