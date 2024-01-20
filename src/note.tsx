import { StateUpdater, useState, useEffect } from "preact/hooks"
import { createRef } from "preact"
import EasyMDE from "easymde"
import "./app.css"
import "../node_modules/easymde/dist/easymde.min.css"

type NoteProps = {
	content: string
	isOpen: boolean
	setIsEditorOpen: StateUpdater<boolean>
}

export function Note({ content, isOpen, setIsEditorOpen }: NoteProps) {
	const editor = createRef()
	const dialog = createRef()
	const [easyMDE, setEasyMDE] = useState(undefined)

	useEffect(() => {
		if (dialog.current === null || easyMDE !== undefined) {
			return
		}
		setEasyMDE(() => {
			const newEditor = new EasyMDE({ element: editor.current })
			newEditor.value(content)
			return newEditor
		})
	}, [content, dialog, easyMDE, editor])

	useEffect(() => {
		if (dialog.current === null) {
			return
		}
		if (isOpen) {
			dialog.current.showModal()
		} else {
			dialog.current.close()
		}
	}, [isOpen, dialog])

	return (
		<dialog class="editor" ref={dialog}>
			<button onClick={() => setIsEditorOpen(false)}>Close</button>
			<button>Save</button>
			<textarea ref={editor} />
		</dialog>
	)
}
