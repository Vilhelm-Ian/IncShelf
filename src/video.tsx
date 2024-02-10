import { createRef } from "preact"
import { useState, useEffect } from "preact/hooks"
import EasyMDE from "easymde"
import { readTextFile } from "@tauri-apps/api/fs"
import { join } from "@tauri-apps/api/path"
import { currentItem } from "./app.tsx"
import { ContextMenu } from "./context_menu.tsx"
import { getPosition } from "./utils/get_position.ts"

export function Note({ openNextInQue }) {
	const [mousePosition, setMousePosition] = useState(undefined)
	const [selection, setSelection] = useState(undefined)
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

	useEffect(() => {
		// TODO potential performance issue use ref instead
		document
			.querySelector(".EasyMDEContainer")
			.addEventListener("mousedown", deselect)
		window.addEventListener("mouseup", showContextMenu)
		return () => {
			document
				.querySelector(".EasyMDEContainer")
				.removeEventListener("mousedown", deselect)
			window.removeEventListener("mouseup", showContextMenu)
		}
	}, [])

	function showContextMenu(e: MouseEvent) {
		const currentSelection = document.getSelection().toString()
		if (currentSelection === "") {
			return
		}
		setMousePosition(getPosition(e))
		setSelection(currentSelection)
	}

	function deselect(e: MouseEvent) {
		if (
			e.currentTarget instanceof HTMLElement &&
			e.currentTarget.tagName !== "SPAN"
		) {
			return
		}
		setMousePosition(undefined)
	}

	return (
		<div class="note-viewer" ref={note}>
			<button onClick={() => openNextInQue()}>Next in Que</button>
			<textarea ref={editor} />
			<ContextMenu position={mousePosition} content={selection} />
		</div>
	)
}
