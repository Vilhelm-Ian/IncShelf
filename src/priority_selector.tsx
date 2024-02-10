import { useState, useEffect } from "preact/hooks"
import "./app.css"
import { useSignalEffect } from "@preact/signals"
import { itemsQue, Book, Note } from "./app.tsx"
import { db } from "./db.ts"
import { newBook } from "./add_document.tsx"

export function PrioritySelector({ file, error }) {
	const [que, setQue] = useState([])
	const [itemsByPriority, setItemsByPriority] = useState([])

	useEffect(() => {
		;(async () => {
			const newBooks: (Book | Note)[] = await db.select(
				"SELECT * from books"
			)
			const notes: Note[] = await db.select("SELECT * from notes")
			const items = newBooks.concat(notes)
			items.sort((a, b) => a.priority - b.priority)
			setItemsByPriority(items)
		})()
	}, [])

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
			convertedValue > itemsQue.value.length ||
			value === ""
		) {
			if (value === "") return
			e.currentTarget.value = String(file.value.priority)
			return
		}
		file.value.priority.value = Number(value)
	}

	async function renderPriorityList(): Promise<JSX.Element[]> {
		const sortedQue = [...itemsByPriority].sort(
			(a, b) => a.priority - b.priority
		)
		await addItemToPriorityList(sortedQue)
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

	async function addItemToPriorityList(
		sortedQue: { name: string; priority: number }[]
	) {
		const name = file.value.file_name.value
		const filePath = file.value.file_path.value
		if (!Number.isNaN(file.value.priority.value) && name !== "") {
			try {
				const result = await canAdd()
				if (result) {
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
	}

	function restartFileSignal() {
		file.value.file_name.value = ""
		file.value.file_path.value = ""
		file.value.priority.value = NaN
	}

	async function canAdd(): Promise<boolean> {
		if (
			itemsQue.value.some(
				(item: Book | Note) => item.name === file.value.file_name.value
			)
		) {
			throw new Error("file already in list")
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
							max={itemsQue.value.length}
						/>
						<div className="priority-controls-buttons">
							<button
								style={
									file.value.priority.value >=
									itemsQue.value.length
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
