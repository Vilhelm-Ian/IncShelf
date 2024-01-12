import { useState, useEffect } from 'preact/hooks'
import { createRef } from 'preact'
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import './app.css'
import { invoke, get_field_names } from "./utils/anki_connect"
import cloze from "./utils/cloze"


export default function Anki(props) {
  const [decks, setDecks] = useState([])
  const [current_deck, setCurrentDeck] = useState("")
  const [current_model, setCurrentModel] = useState("")
  const [fieldNames, setFieldNames] = useState([])
  const [model_types, setModelTypes] = useState([])
  const [fields, setFields] = useState({})

  const dialog = createRef()

  useEffect(() => {
    dialog.current.showModal()
    invoke("deckNames", 6).then(res => setDecks(res))
    async function get_names_and_fields() {
      let model_types_result = await invoke("modelNames", 6);
      setModelTypes(model_types_result)
      set_field_names(model_types_result[0])
    }
    get_names_and_fields()
  }, [])

  useEffect(() => {
    const keyDownHandler = event => {
      // console.log('User pressed: ', event.key);
      // console.log(event.shiftKey)
      // console.log(event.ctrlKey)
      // console.log(event.key)

      if (event.ctrlKey && event.shiftKey && event.key == "M") {
        cloze()
        console.log("detected")
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);


  function set_field_names(model_type) {
    get_field_names(model_type).then(names => setFieldNames(names)).catch(err => console.log(err))
  }

  function update_current_model(model_type) {
    setCurrentModel(model_type)
    set_field_names(model_type)
  }

  function send() {
    console.log(fields)
    invoke('addNote', 6, {
      note: {
        deckName: current_deck,
        modelName: current_model,
        fields
      }
    }
    ).then(res => console.log(res))
      .catch(err => console.log(err));
  }

  function update_fields(field, content) {
    setFields(old => {
      let temp = { ...old }
      temp[field] = content
      return temp
    })
  }

  return (
    <dialog class="anki" ref={dialog}>
      <label for="decks">Choose a deck</label>
      <select onChange={(e) => setCurrentDeck(e.target.value)} name="decks">
        {decks.map(deck => <option value={deck}>{deck}</option>)}
      </select>
      <label for="note_types">Choose a note typ</label>
      <select onChange={(e) => update_current_model(e.target.value)} name="note_typese">
        {model_types.map(note_type => <option value={note_type}>{note_type}</option>)}
      </select>
      {fieldNames.map(field => {
        return <>
          <label>{field}</label>
          <span onInput={(e) => update_fields(field, e.currentTarget.textContent)} contenteditable role="textbox" />
        </>
      })
      }
      <p>{props.text}</p>
      <button onclick={send}>Add</button>
    </dialog>
  )
}

