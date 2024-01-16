import { useState, useEffect } from 'preact/hooks'
import './app.css'
import { FileList } from "./filelist"
import { Reader } from "./reader"
import 'cherry-markdown/dist/cherry-markdown.min.css'
import { readBinaryFile } from '@tauri-apps/api/fs'
import { createContext } from 'preact'

export const DB = createContext()

export function App() {
  let [fileBinary, setFileBinary] = useState([])
  let [books, setBooks] = useState([])

  async function open_file(file_path, file_name) {
    try {
      // let data = await invoke('open_file_binary', { path: file_path })
      // Opening the file is slow in development because of serde
      //https://github.com/tauri-apps/tauri/issues/1817
      // To get around that I have to use invoke-http
      let data = await readBinaryFile(file_path)
      setFileBinary(data)
      // let f = new File([data], file_name, {
      //   type: "application/pdf"
      // })
      // document.documentViewer.openFile(f)
      // setDisplay("none")
    }
    catch (err) {
      console.log(err)
    }
  }


  async function open_next_in_que() {
    let new_books = [...books]
    new_books.sort((a,b)=>a.priority-b.priority)
    let next_book = new_books[Math.floor(Math.random()*3)]
    await open_file(next_book.file_path,next_book.name)
  }

  //Syncs to local storage
  useEffect(()=> {
   console.log(books)
    if(books.length === 0) {
      return
    }
   localStorage.setItem("books", JSON.stringify(books))
  },[books])

  useEffect(() => {
    let books = JSON.parse(localStorage.getItem("books"))
    if (books !== null) {
      setBooks(books)
      console.log("books",books)
    }
  }, [])

  return (
    <DB.Provider value={[books, setBooks]}>
    <div class="container">
      {
        fileBinary.length === 0 ? <FileList open_next_in_que={open_next_in_que} books={books} open_file={open_file} /> :
          <Reader open_next_in_que={open_next_in_que} key={fileBinary} fileBinary={fileBinary} />
      }
    </div>
    </DB.Provider>
  )
}
