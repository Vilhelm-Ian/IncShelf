import {  useEffect } from "preact/hooks"
import { createRef } from "preact"
import EasyMDE from "easymde"
import "./app.css"
import "../node_modules/easymde/dist/easymde.min.css"

export function Note(props) {
	const editor = createRef()
	const dialog = createRef()

	useEffect(() => {
		if (editor.current === null) {
			return
		}
		const easyMDE = new EasyMDE({ element: editor.current })
		easyMDE.value(props.content)
	}, [editor, props.content])

	useEffect(() => {
		if (dialog.current === null) {
			return
		}
		if (props.isOpen) {
			dialog.current.showModal()
		} else {
			dialog.current.close()
		}
	}, [props.isOpen, dialog])

	return (
		<dialog className="editor" ref={dialog}>
			<textarea ref={editor} />
		</dialog>
	)
}
