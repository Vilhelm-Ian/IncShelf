import { useEffect, useState } from "preact/hooks"
import { createRef } from "preact"
import "./app.css"
import { open } from "@tauri-apps/api/dialog"
import getFileName from "./utils/get_file_name.ts"
import { generateQue, Book, Note } from "./app.tsx"
import { signal, useSignalEffect, useSignal } from "@preact/signals"
import { isDocumentDialogOpen as isOpen } from "./filelist.tsx"
import { PrioritySelector } from "./priority_selector.tsx"
import { exists } from "@tauri-apps/api/fs"
import { addBook, db, updatePriorities } from "./db.ts"

const file = signal({
	file_path: signal(""),
	file_name: signal(""),
	priority: signal(NaN),
})

let itemsByPriority: (Book | Note)[] = []

export function AddDocumentDialog() {
	const [tags, setTags] = useState([])
	const dialog = createRef<HTMLDialogElement>()
	const error = useSignal("")

	useEffect(() => {
		;(async () => {
			const newBooks: (Book | Note)[] = await db.select(
				"SELECT * from books"
			)
			const notes: Note[] = await db.select("SELECT * from notes")
			const items = newBooks.concat(notes)
			items.sort((a, b) => a.priority - b.priority)
			itemsByPriority = items
		})()
	}, [])

	useSignalEffect(() => {
		if (dialog.current === null) {
			return
		}
		isOpen.value ? dialog.current.showModal() : dialog.current.close()
	})

	async function addFilePath() {
		try {
			const selected = await open({
				multiple: false,
				filters: [
					{
						name: "Document",
						extensions: ["pdf"],
					},
				],
			})
			if (Array.isArray(selected) || selected === null) {
				throw new Error("selected multiple or zero files")
			}
			file.value.file_path.value = selected
			file.value.priority.value = 0
			file.value.file_name.value = await getFileName(
				file.value.file_path.value
			)
		} catch (err) {
			if (err.message === undefined) {
				error.value = err
			} else {
				error.value = err.message
			}
		}
	}

	function addTags(e: InputEvent) {
		if (!(e.currentTarget instanceof HTMLInputElement)) {
			return
		}
		setTags(e.currentTarget.value.split(" "))
	}

	async function addToDb() {
		try {
			const doesExist = await exists(file.value.file_path.value)
			if (!doesExist) {
				throw new Error("file dosen't exist")
			}
			const book = newBook(
				file.value.file_name.value,
				file.value.file_path.value,
				file.value.priority.value
			)
			book.tags = tags
			addBook(book)
			updatePriorities(itemsByPriority)
			generateQue()
			isOpen.value = false
		} catch (err) {
			error.value = err.message
		}
	}

	async function updatePath(e: InputEvent) {
		try {
			if (e.currentTarget instanceof HTMLInputElement) {
				file.value.file_path.value = e.currentTarget.value
				file.value.file_name.value = await getFileName(
					file.value.file_path.value
				)
			}
		} catch (err) {
			error.value = err.message
		}
	}

	return (
		<dialog ref={dialog}>
			<p>{error.value}</p>
			<div className="add-file-dialog-buttons">
				<button
					onClick={() => {
						isOpen.value = false
					}}
				>
					Close
				</button>
				<button onClick={addFilePath}>File</button>
				<button
					style={`display: ${file.value.file_path.value === "" ? "none" : "visible"}`}
					onClick={addToDb}
				>
					Add
				</button>
			</div>
			<p>file path: {file.value.file_path.value}</p>
			<input onInput={updatePath} value={file.value.file_path.value} />
			<label>Tags</label>
			<input onInput={(e) => addTags(e)} />
			<br />
			<PrioritySelector file={file} error={error} />
		</dialog>
	)
}

export function newBook(
	name: string,
	filePath: string,
	priority: number
): Book {
	return {
		name,
		filePath,
		priority,
		readPages: [],
		inQue: true,
		lastReadPage: 0,
		tags: [],
		dueDate: new Date(),
		interval: 0,
		numberOfReadPages: 0,
		timesRead: 0,
	}
}
