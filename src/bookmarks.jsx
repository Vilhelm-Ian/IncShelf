import { useState } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'
import Anki from "./anki"

export default function Bookmark(props) { 
  function open_dialog() {
    document.querySelector("#dialog-"+props.index).showModal();
  }
  return (
    <div class="bookmark" >
      <p>{props.text}</p>
      <button>Add Note</button>
      <button onClick={open_dialog}>Create Anki cards</button>
      <Anki text={props.text} index={props.index}/>
    </div>
  )
}
