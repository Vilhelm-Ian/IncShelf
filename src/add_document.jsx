import { useState, useContext } from "preact/hooks"
import "./app.css"
import { open } from "@tauri-apps/api/dialog"
import getFileName from "./utils/get_file_name"
import { DB } from "./app"
import { signal } from "@preact/signals"

const file = signal({
	file_path: signal(""),
	file_name: signal(""),
	priority: signal(NaN),
})

const priorityQue = signal([])

export function AddDocumentDialog(props) {
	const [tags, setTags] = useState([])
	const [books, setBooks] = useContext(DB)

	// Open a selection dialog for image files
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
		console.log(selected)
		file.value.file_path.value = selected
		file.value.priority.value = 0
		file.value.file_name.value = await getFileName(
			file.value.file_path.value
		)
		priorityQue.value = [...books].sort((a, b) => a.priority - b.priority)
	}

	function addTags(e) {
		setTags(e.target.value.split(" "))
	}

	function incrementPriority(increment) {
		file.value.priority.value += increment
	}

	function updatePriority(e) {
		console.log("updating")
		const value = e.target.value
		if (
			Number.isNaN(Number(value)) ||
			value < 0 ||
			value > books.length ||
			value === ""
		) {
			if (value === "") return
			e.target.value = Number(file.value.priority)
			return
		}
		console.log("new")
		console.log(Number(e.target.value))
		file.value.priority.value = Number(value)
	}
	// WANT TO IN THE FUTURE TO USE INDEXDDB
	async function addToDb() {
		setBooks((oldBooks) => {
			const newBooks = [...oldBooks]
			newBooks.push({
				name: file.value.file_name.value,
				file_path: file.value.file_path.value,
				priority: file.value.priority.value,
				tags,
				due_date: Date.now(),
				interval: 0,
			})
			return newBooks
		})
		document.getElementById("add_document_dialog").close()
	}

	function renderPriorityList() {
		const sortedQue = [...books].sort((a, b) => a.priority - b.priority)
		if (!Number.isNaN(file.value.priority.value)) {
			sortedQue.splice(file.value.priority.value, 0, {
				name: file.value.file_name.value,
			})
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
		<dialog id="add_document_dialog">
			<button onClick={addFilePath}>File</button>
			<p>file path: {file.value.file_path.value}</p>
			<input
				onChange={(e) => (file.value.file_path.value = e.target.value)}
				value={file.value.file_path.value}
			/>
			<label>Tags</label>
			<input onChange={addTags} />
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
