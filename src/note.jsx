import { useState, useEffect } from 'preact/hooks'
import { createRef } from 'preact'
import EasyMDE from 'easymde'
import './app.css'
import "../node_modules/easymde/dist/easymde.min.css"


export function Note(props) {
  let [text, setText] = useState("")
  let [html, setHTML] = useState()
  let editor = createRef()
  let dialog = createRef()

  useEffect(() => {
    setText(props.content)
  }, [props.content])

  useEffect(() => {
    if(editor.current === null) {
      return
    }
    const easyMDE = new EasyMDE({element: editor.current});
    console.log("setting text", text)
    easyMDE.value(props.content)
  }, [editor.current === null])

  useEffect(() => {
    if (dialog.current === null) {
      return
    }
    if (props.isOpen) {
      dialog.current.showModal()
    } else {
      dialog.current.close()
    }
  }, [props.isOpen])


  return (
    <dialog class="editor" ref={dialog}>
      <textarea value={text} ref={editor} />
    </dialog>
  )
}

