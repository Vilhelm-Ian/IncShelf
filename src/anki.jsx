import { useState, useEffect } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'
import {invoke, get_field_names} from "./utils/anki_connect"

export default function Anki(props) { 
const [decks, setDecks] = useState([])
const [model_types, setModelTypes] = useState([])
const [fields, setFields] = useState([])

    useEffect(()=> {
        invoke("deckNames", 6).then(res=>setDecks(res))
        async function get_names_and_fields() {
       let model_types_result =  await invoke("modelNames", 6);
       setModelTypes(model_types_result)
        set_fields(model_types_result[0])
        }
        get_names_and_fields()
    },[])

 function set_fields(model_type) {
        get_field_names(model_type).then(names=>setFields(names)).catch(err=>console.log(err))   
    }


  let [question, setQuestion] = useState("")
  function send() {
    invoke('addnote', 6, {note: {
            deckName: "temp",
            modelName: "Basic",
            fields: {
                Front: question,
                Back: props.text
            }
      }
      }
    ).then(res=>console.log(res))
    .catch(err=>console.log(err));
    console.log(question)
  }
  


  
    let decks_select_elements = decks.map(deck => <option value={deck}>{deck}</option>)
    let model_types_select_elements = model_types.map(note_type => <option value={note_type}>{note_type}</option>)
    let field_elements = fields.map(field => {
   return <>
        <label>{field}</label>
        <textarea/>
     </>
    })
  
  return (
  <dialog class="anki" id={"dialog-"+props.index}>
    <label for="decks">Choose a deck</label>
    <select name="decks">
        {decks_select_elements}
    </select>
    <label for="note_types">Choose a note typ</label>
    <select onChange={(e)=> set_fields(e.target.value)} name="note_typese">
                        {model_types_select_elements}
    </select>
        {field_elements}
    // <textarea onChange={(e)=> setQuestion(e.target.value)}></textarea>
    <p>{props.text}</p>
    <button onclick={send}>Add</button>
  </dialog>
  )
}

