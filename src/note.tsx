import { StateUpdater, useState, useEffect } from "preact/hooks"
import { createRef } from "preact"
import { homeDir } from "@tauri-apps/api/path"
import { BaseDirectory, writeTextFile } from "@tauri-apps/api/fs"
import { open } from "@tauri-apps/api/dialog"
import { signal } from "@preact/signals"
import EasyMDE from "easymde"
import "./app.css"
import "../node_modules/easymde/dist/easymde.min.css"

type NoteProps = {
	content: string
	isOpen: boolean
	setIsEditorOpen: StateUpdater<boolean>
}

const name = signal(`${Date.now()}.md`)
const path = signal<undefined | string>(undefined)

export function Note({ content, isOpen, setIsEditorOpen }: NoteProps) {
	const editor = createRef()
	const dialog = createRef()
	const error = signal("")
	const [easyMDE, setEasyMDE] = useState(undefined)

	useEffect(() => {
		;(async () => {
			const dir = await homeDir()
			path.value = dir
		})()
	}, [])

	useEffect(() => {
		if (dialog.current === null || easyMDE !== undefined) {
			return
		}
		setEasyMDE(() => {
			const newEditor = new EasyMDE({
				element: editor.current,
				sideBySideFullscreen: false,
			})
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

	async function saveFile() {
		try {
			// TODO this won't work for windows
			await writeTextFile(`${path.value}/${name.value}`, easyMDE.value())
		} catch (err) {
			error.value = `error: ${err}`
		}
	}

	function updateName(e: InputEvent) {
		if (!(e.currentTarget instanceof HTMLInputElement)) {
			return
		}
		name.value = e.currentTarget.value
	}

	function updatePath(e: InputEvent) {
		if (!(e.currentTarget instanceof HTMLInputElement)) {
			return
		}
		name.value = e.currentTarget.value
	}

	async function openDir() {
		try {
			const directory = await open({
				multiple: false,
				directory: true,
			})
			if (Array.isArray(directory)) {
				return
			}
			path.value = directory
		} catch (err) {
			error.value = err
		}
	}

	return (
		<dialog class="editor" ref={dialog}>
			<p>{error.value}</p>
			<p>File Name</p>
			<input onInput={updateName} value={name.value} />
			<p>Path</p>
			<input onInput={updatePath} value={path.value} />
			<button onClick={openDir}>Chose Folder</button>
			<button onClick={() => setIsEditorOpen(false)}>Close</button>
			<button onClick={saveFile}>Save</button>
			<textarea ref={editor} />
		</dialog>
	)
}
