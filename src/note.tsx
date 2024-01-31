import { StateUpdater, useState, useEffect } from "preact/hooks"
import { createRef } from "preact"
import { homeDir, join } from "@tauri-apps/api/path"
import { writeTextFile } from "@tauri-apps/api/fs"
import { open } from "@tauri-apps/api/dialog"
import { signal } from "@preact/signals"
import { PrioritySelector } from "./priority_selector.tsx"
import EasyMDE from "easymde"
import "./app.css"
import "../node_modules/easymde/dist/easymde.min.css"

type NoteProps = {
	content: string
	source: string | undefined
	isOpen: boolean
	setIsEditorOpen: StateUpdater<boolean>
}

const file = signal({
	file_path: signal(""),
	file_name: signal(`${Date.now()}.md`),
	priority: signal(NaN),
})

const name = signal(`${Date.now()}.md`)
const path = signal<undefined | string>(undefined)
const error = signal("")

export function Note({ content, isOpen, setIsEditorOpen, source }: NoteProps) {
	const editor = createRef()
	const dialog = createRef()
	const [easyMDE, setEasyMDE] = useState(undefined)

	useEffect(() => {
		;(async () => {
			const dir = await homeDir()
			path.value = dir
			file.value.file_path.value = dir
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
			let editorContent = content
			if (source !== undefined) {
				editorContent = `[Source](<${source}>) ${editorContent}`
			}
			newEditor.value(editorContent)
			return newEditor
		})
	}, [content, dialog, easyMDE, editor, source])

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
			await writeTextFile(
				await join(path.value, name.value),
				easyMDE.value()
			)
			let notes = JSON.parse(localStorage.getItem("notes"))
			if (notes === null) {
				notes = []
			}
			notes.push({ name: name.value, path: path.value })
			localStorage.setItem("notes", JSON.stringify(notes))
			setIsEditorOpen(false)
		} catch (err) {
			error.value = `error: ${err}`
		}
	}

	function updateName(e: InputEvent) {
		if (!(e.currentTarget instanceof HTMLInputElement)) {
			return
		}
		name.value = e.currentTarget.value
		file.value.file_name.value = e.currentTarget.value
	}

	function updatePath(e: InputEvent) {
		if (!(e.currentTarget instanceof HTMLInputElement)) {
			return
		}
		path.value = e.currentTarget.value
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
			<div style="display:flex;">
				<textarea ref={editor} />
				<PrioritySelector file={file} />
			</div>
		</dialog>
	)
}
