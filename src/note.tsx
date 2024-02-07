import { StateUpdater, useState, useEffect } from "preact/hooks"
import { createRef } from "preact"
import { homeDir, join } from "@tauri-apps/api/path"
import { writeTextFile } from "@tauri-apps/api/fs"
import { open } from "@tauri-apps/api/dialog"
import { signal, useSignal } from "@preact/signals"
import { PrioritySelector } from "./priority_selector.tsx"
import EasyMDE from "easymde"
import "./app.css"
import "../node_modules/easymde/dist/easymde.min.css"
import { itemsQue } from "./app.tsx"
import { db } from "./db.ts"

type NoteProps = {
	content: string
	source: string | undefined
	isOpen: boolean
	setIsEditorOpen: StateUpdater<boolean>
	tagsProp: [string]
}

const file = signal({
	file_path: signal(""),
	file_name: signal(`${Date.now()}.md`),
	priority: signal(NaN),
})

;(async () => {
	const dir = await homeDir()
	path.value = dir
	file.value.file_path.value = dir
	file.value.priority.value = itemsQue.value.length
})()

const name = signal(`${Date.now()}.md`)
const path = signal<undefined | string>(undefined)

export function Note({
	content,
	isOpen,
	setIsEditorOpen,
	source,
	tagsProp,
}: NoteProps) {
	const editor = createRef()
	const dialog = createRef()
	const [easyMDE, setEasyMDE] = useState(undefined)
	const error = useSignal("")
	const tags = useSignal(tagsProp)

	useEffect(() => {
		if (dialog.current === null || easyMDE !== undefined) {
			return
		}
		setEasyMDE(() => {
			const newEditor = new EasyMDE({
				element: editor.current,
				sideBySideFullscreen: false,
				spellChecker: false,
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
			await db.execute(
				"INSERT into notes (name, filePath, priority, inQue, timesRead, tags) VALUES ($1, $2, $3, $4, $5, $6)",
				[
					file.value.file_name.value,
					file.value.file_path.value,
					file.value.priority.value,
					true,
					0,
					tags.value,
				]
			)
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

	function updateTags(e: InputEvent) {
		if (e.currentTarget instanceof HTMLInputElement) {
			tags.value = e.currentTarget.value.split(" ")
		}
	}

	return (
		<dialog class="editor" ref={dialog}>
			<p>{error.value}</p>
			<p>File Name</p>
			<input onInput={updateName} value={name.value} />
			<p>Path</p>
			<input onInput={updatePath} value={path.value} />
			<p>Tags</p>
			<input onInput={updateTags} value={tags.value.toString()} />
			<button onClick={openDir}>Chose Folder</button>
			<button onClick={() => setIsEditorOpen(false)}>Close</button>
			<button onClick={saveFile}>Save</button>
			<div style="display:flex;">
				<textarea ref={editor} />
				<PrioritySelector error={error} file={file} />
			</div>
		</dialog>
	)
}
