import { readTextFile, writeTextFile } from "@tauri-apps/api/fs"
import { createRef } from "preact"
import { useEffect, useState } from "preact/hooks"
import { join } from "@tauri-apps/api/path"

export function AppendNote({ isOpen, content, setOpen }) {
	const dialog = createRef()
	const [notes, setNotes] = useState([])

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

	useEffect(() => {
		const notes = JSON.parse(localStorage.getItem("notes"))
		setNotes(notes)
	}, [])

	async function appendNote(name: string, path: string) {
		const filePath = await join(path, name)
		let fileContent = await readTextFile(filePath)
		fileContent += `\n${content}`
		await writeTextFile(filePath, fileContent)
		setOpen(false)
	}

	return (
		<dialog class="append" ref={dialog}>
			<input>Still haven't added a fuzzy finder</input>
			<ol>
				{notes.map((note, index) => (
					<li
						onClick={() => {
							appendNote(note.name, note.path)
						}}
						key={`key${index}`}
					>
						{note.name}
					</li>
				))}
			</ol>
		</dialog>
	)
}
