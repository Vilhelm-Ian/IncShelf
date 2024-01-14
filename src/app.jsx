import { useState, useEffect } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'
import Bookmark from "./bookmarks"
import { FileList } from "./filelist"
import { Reader } from "./reader"
import { HeatMap } from "./heat_map"
import { createElement } from 'preact'
import 'cherry-markdown/dist/cherry-markdown.min.css'
import Cherry from 'cherry-markdown';


export function App() {
  let [fileBinary, setFileBinary] = useState([])
  return (
    <div class="container">
      {
        fileBinary.length === 0 ? <FileList setFileBinary={setFileBinary} /> :
          <Reader fileBinary={fileBinary} />
      }
    </div>
  )
}
