import { useState } from "preact/hooks"
import "./app.css"
import { useSignalEffect } from "@preact/signals"
import { books, newBook, Book } from "./app.tsx"
import { exists } from "@tauri-apps/api/fs"

export function PrioritySelector({ file, error }) {
	const [que, setQue] = useState([])

	useSignalEffect(() => {
		renderPriorityList().then((queRendered) => setQue(queRendered))
	})

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

	return (
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
	)
}
