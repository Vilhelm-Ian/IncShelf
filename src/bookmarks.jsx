import { useState } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'
// import Anki from "./anki"
import Note from "./note"

export default function Bookmark(props) { 
  let [dialog_element, setDialogElement] = useState()

  // function open_dialog() {
  //   let dialog = <Anki style="display: none;" text={props.text} index={props.index}/>
  //   setDialogElement(dialog)
  // }

  return (
    <div class="bookmark" >
      <p>{props.text}</p>
      <button>Add Note</button>
      <button onClick={open_dialog}>Create Anki cards</button>
      {dialog_element}
      <Note text={props.text}/>
      <div id="markdown">
    </div>
    </div>
  )
}
