import { useState } from "preact/hooks"
import { createRef } from "preact"
import "./app.css"
import { open } from "@tauri-apps/api/dialog"
import getFileName from "./utils/get_file_name.ts"
import { newBook, books, Book } from "./app.tsx"
import { signal, useSignalEffect } from "@preact/signals"
import { isDocumentDialogOpen as isOpen } from "./filelist.tsx"
import { exists } from "@tauri-apps/api/fs"

const file = signal({
	file_path: signal(""),
	file_name: signal(""),
	priority: signal(NaN),
})
const error = signal("")

export function AddDocumentDialog() {
	const [tags, setTags] = useState([])
	const dialog = createRef<HTMLDialogElement>()
	const [que, setQue] = useState([])

	useSignalEffect(() => {
		renderPriorityList().then((queRendered) => setQue(queRendered))
	})

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

	function incrementPriority(increment: number) {
		file.value.priority.value += increment
	}

	function updatePriority(e: InputEvent) {
		if (!(e.currentTarget instanceof HTMLInputElement)) {
			return
		}
		const value = e.currentTarget.value
		const convertedValue = Number(value)
		if (
			Number.isNaN(Number(value)) ||
			convertedValue < 0 ||
			convertedValue > books.value.length ||
			value === ""
		) {
			if (value === "") return
			e.currentTarget.value = String(file.value.priority)
			return
		}
		file.value.priority.value = Number(value)
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

	async function renderPriorityList(): Promise<any> {
		const sortedQue = [...books.value].sort(
			(a, b) => a.priority - b.priority
		)
		if (!Number.isNaN(file.value.priority.value)) {
			const name = file.value.file_name.value
			const filePath = file.value.file_name.value
			try {
				if (await canAdd()) {
					sortedQue.splice(
						file.value.priority.value,
						0,
						newBook(name, filePath, 0)
					)
				}
				error.value = ""
			} catch (err) {
				restartFileSignal()
				if (err.message === undefined) {
					error.value = err
				} else {
					error.value = err.message
				}
			}
		}
		return sortedQue.map((element, index) => (
			<li
				key={element.name}
				style={
					index === file.value.priority.value
						? "border: solid 1px red;"
						: "border: solid 1px black"
				}
			>
				{element.name}
			</li>
		))
	}

	function restartFileSignal() {
		file.value.file_name.value = ""
		file.value.file_path.value = ""
		file.value.priority.value = NaN
	}

	async function canAdd(): Promise<boolean> {
		if (
			books.value.some(
				(book: Book) => book.name === file.value.file_name.value
			)
		) {
			throw new Error("file already exists")
		}
		const doesExist = await exists(file.value.file_path.value)
		if (!doesExist) {
			throw new Error("file dosen't exist")
		}
		return true
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
			<div style="display: flex; flex-direction: cloumn;">
				<ol className="priority_list">{que}</ol>
				<div>
					{!Number.isNaN(file.value.priority.value) ? (
						<div class="priority-controls">
							<label>Priority</label>
							<input
								onInput={updatePriority}
								value={file.value.priority.value}
								max={books.value.length}
							/>
							<div className="priority-controls-buttons">
								<button
									style={
										file.value.priority.value >=
										books.value.length
											? "display: none"
											: ""
									}
									onClick={() => incrementPriority(1)}
								>
									Down
								</button>
								<button
									style={
										file.value.priority.value === 0
											? "display: none"
											: ""
									}
									onClick={() => incrementPriority(-1)}
								>
									Up
								</button>
							</div>
						</div>
					) : (
						<></>
					)}
				</div>
			</div>
		</dialog>
	)
}
