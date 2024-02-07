import { createRef } from "preact"
import { useState, useEffect } from "preact/hooks"
import EasyMDE from "easymde"
import { readTextFile } from "@tauri-apps/api/fs"
import { join } from "@tauri-apps/api/path"
import { currentItem } from "./app.tsx"

export function Note({ openNextInQue }) {
	const editor = createRef()
	const note = createRef()
	const [easyMDE, setEasyMDE] = useState(undefined)

	useEffect(() => {
		if (editor.current === null || easyMDE !== undefined) {
			return
		}
		setEasyMDE(() => {
			const newEditor = new EasyMDE({
				element: editor.current,
				sideBySideFullscreen: false,
				spellChecker: false,
			})
			;(async () => {
				const path = await join(
					currentItem.value.filepath,
					currentItem.value.name
				)
				const content = await readTextFile(path)
				newEditor.value(content)
			})()
			return newEditor
		})
	}, [])

	return (
		<div class="note-viewer" ref={note}>
			<button onClick={() => openNextInQue()}>Next in Que</button>
			<textarea ref={editor} />
		</div>
	)
}
