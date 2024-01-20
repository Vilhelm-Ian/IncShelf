import { useState, useContext } from "preact/hooks"
import { createRef } from "preact"
import "./app.css"
import { open } from "@tauri-apps/api/dialog"
import getFileName from "./utils/get_file_name.ts"
import { DB, newBook } from "./app.tsx"
import { signal, useSignalEffect } from "@preact/signals"
import { isDocumentDialogOpen as isOpen } from "./filelist.tsx"

const file = signal({
	file_path: signal(""),
	file_name: signal(""),
	priority: signal(NaN),
})

const priorityQue = signal([])

export function AddDocumentDialog() {
	const [tags, setTags] = useState([])
	const [books, setBooks] = useContext(DB)
	const dialog = createRef<HTMLDialogElement>()

	useSignalEffect(() => {
		if (dialog.current === null) {
			return
		}
		isOpen.value ? dialog.current.showModal() : dialog.current.close()
	})

	async function addFilePath() {
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
			// user selected multiple files
			return
		}
		file.value.file_path.value = selected
		file.value.priority.value = 0
		file.value.file_name.value = await getFileName(
			file.value.file_path.value
		)
		priorityQue.value = [...books].sort((a, b) => a.priority - b.priority)
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
			convertedValue > books.length ||
			value === ""
		) {
			if (value === "") return
			e.currentTarget.value = String(file.value.priority)
			return
		}
		file.value.priority.value = Number(value)
	}
	// TODO WANT TO IN THE FUTURE TO USE INDEXDDB
	async function addToDb() {
		setBooks((oldBooks) => {
			const newBooks = [...oldBooks]
			newBooks.push({
				name: file.value.file_name.value,
				filePath: file.value.file_path.value,
				priority: file.value.priority.value,
				tags,
				dueDate: new Date(),
				interval: 0,
				inQue: true,
				lastReadPage: NaN,
				readPages: [],
			})
			return newBooks
		})
		isOpen.value = false
	}

	function renderPriorityList() {
		const sortedQue = [...books].sort((a, b) => a.priority - b.priority)
		if (!Number.isNaN(file.value.priority.value)) {
			const name = file.value.file_name.value
			const filePath = file.value.file_name.value
			sortedQue.splice(
				file.value.priority.value,
				0,
				newBook(name, filePath)
			)
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

	return (
		<dialog ref={dialog}>
			<button
				onClick={() => {
					isOpen.value = false
				}}
			>
				Close
			</button>
			<button onClick={addFilePath}>File</button>
			<p>file path: {file.value.file_path.value}</p>
			<input
				onInput={(e) =>
					(file.value.file_path.value = e.currentTarget.value)
				}
				value={file.value.file_path.value}
			/>
			<label>Tags</label>
			<input onInput={(e) => addTags(e)} />
			<label>Priority</label>
			<button onClick={addToDb}>Add</button>
			<div style="display: flex; flex-direction: cloumn;">
				<ol className="priority_list">{renderPriorityList()}</ol>
				<div>
					{!Number.isNaN(file.value.priority.value) ? (
						<div>
							<input
								onInput={updatePriority}
								value={file.value.priority.value}
								max={books.length}
							/>
							<button
								style={
									file.value.priority.value >= books.length
										? "display: none"
										: ""
								}
								onClick={() => incrementPriority(1)}
							>
								up
							</button>
							<button
								style={
									file.value.priority.value === 0
										? "display: none"
										: ""
								}
								onClick={() => incrementPriority(-1)}
							>
								Down
							</button>
						</div>
					) : (
						<></>
					)}
				</div>
			</div>
		</dialog>
	)
}
