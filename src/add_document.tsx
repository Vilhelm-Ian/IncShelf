import { useState } from "preact/hooks"
import { createRef } from "preact"
import "./app.css"
import { open } from "@tauri-apps/api/dialog"
import getFileName from "./utils/get_file_name.ts"
import { newBook, books, Book } from "./app.tsx"
import { signal, useSignalEffect, useSignal } from "@preact/signals"
import { isDocumentDialogOpen as isOpen } from "./filelist.tsx"
import { PrioritySelector } from "./priority_selector.tsx"

const file = signal({
	file_path: signal(""),
	file_name: signal(""),
	priority: signal(NaN),
})

export function AddDocumentDialog() {
	const [tags, setTags] = useState([])
	const dialog = createRef<HTMLDialogElement>()
	const error = useSignal("")

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

	function addToDb() {
		let newBooks = [...books.value]
		const book = newBook(
			file.value.file_name.value,
			file.value.file_path.value,
			file.value.priority.value
		)
		book.tags = tags
		newBooks.splice(file.value.priority.value, 0, book)
		newBooks = newBooks.map((book, index) => {
			book.priority = index
			return book
		})
		books.value = newBooks
		isOpen.value = false
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
