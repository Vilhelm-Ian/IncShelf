import { useState, useEffect, StateUpdater } from "preact/hooks"
import "./app.css"
import { FileList } from "./filelist.tsx"
import { Reader } from "./reader.tsx"
import "cherry-markdown/dist/cherry-markdown.min.css"
import { readBinaryFile } from "@tauri-apps/api/fs"
import { createContext } from "preact"
import { signal } from "@preact/signals"

export type Book = {
	name: string
	filePath: string
	priority: number
	readPages: boolean[]
	inQue: boolean
	lastReadPage: number
	tags: string[]
	dueDate: Date
	interval: number
	numberOfReadPages: number
}

export function newBook(name: string, filePath: string): Book {
	return {
		name,
		filePath,
		priority: NaN,
		readPages: [],
		inQue: true,
		lastReadPage: 0,
		tags: [],
		dueDate: new Date(),
		interval: 0,
		numberOfReadPages: 0,
	}
}

export const DB = createContext<
	[Book[], StateUpdater<Book[]>, number, StateUpdater<number>] | undefined
>(undefined)
export function App() {
	const [fileBinary, setFileBinary] = useState<undefined | Uint8Array>(
		undefined
	)
	const [books, setBooks] = useState<Book[]>([])
	const [index, setIndex] = useState(null)
	const error = signal("")

	async function openFile(filePath: string) {
		try {
			// let data = await invoke('openFile_binary', { path: filePath })
			// Opening the file is slow in development because of serde
			// https://github.com/tauri-apps/tauri/issues/1817
			const data = await readBinaryFile(filePath)
			setFileBinary(data)
		} catch (err) {
			error.value = `Failed opening file ${err.message}`
		}
	}

	async function openNextInQue() {
		const newBooks = [...books]
		newBooks.sort((a, b) => a.priority - b.priority)
		const index = Math.floor(Math.random() * 3)
		const nextBook = newBooks[index]
		setIndex(index)
		await openFile(nextBook.filePath)
	}

	// Syncs to local storage
	useEffect(() => {
		if (books.length === 0) {
			return
		}
		localStorage.setItem("books", JSON.stringify(books))
	}, [books])

	useEffect(() => {
		const books = JSON.parse(localStorage.getItem("books"))
		if (books !== null) {
			setBooks(books)
		}
	}, [])

	return (
		<DB.Provider value={[books, setBooks, index, setIndex]}>
			<div className="container">
				<p>{error.value}</p>
				{index === null ? (
					<FileList openNextInQue={openNextInQue} />
				) : (
					<Reader openNextInQue={openNextInQue} key={index} />
				)}
			</div>
		</DB.Provider>
	)
}
