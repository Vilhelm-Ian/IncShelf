import './app.css'
import { Anki } from './anki'
import { Note } from './note'
import { useEffect, useState } from 'preact/hooks'
import { createRef } from 'preact'


export function ContextMenu(props) {
  const [isAnkiOpen, setIsAnkiOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const context_menu = createRef()

  useEffect(() => {
    if (props.position !== undefined) {
      context_menu.current.style.visibility = "visible"
      context_menu.current.style.top = props.position.y + "px"
      context_menu.current.style.left = props.position.x + "px"
    } else {
      context_menu.current.style.visibility = "hidden"
    }
  }, [props.position])



  return (
    <>
      <ul ref={context_menu} class="context_menu">
        <li onclick={() => setIsEditorOpen(true)}>Add Note</li>
        <li onclick={() => setIsAnkiOpen(true)}>Create Anki Card</li>
        <li>X-Ray(not yet implemented)</li>
        <li>Definition(not yet implemented)</li>
        <li>Translate(not yet implemented)</li>
      </ul>
      {isAnkiOpen ? <Anki content={props.content} isOpen={isAnkiOpen} setIsAnkiOpen={setIsAnkiOpen} /> : <></>}
      {isEditorOpen ? <Note content={props.content} isOpen={isEditorOpen} setIsEditorOpen={setIsEditorOpen} /> : <></>}
    </>
  )
}
