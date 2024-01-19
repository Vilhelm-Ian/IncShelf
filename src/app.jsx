import { useState, useEffect } from "preact/hooks"
import "./app.css"
import { FileList } from "./filelist"
import { Reader } from "./reader"
import "cherry-markdown/dist/cherry-markdown.min.css"
import { readBinaryFile } from "@tauri-apps/api/fs"
import { createContext } from "preact"

export const DB = createContext()

export function App() {
	const [fileBinary, setFileBinary] = useState([])
	const [books, setBooks] = useState([])

	async function openFile(filePath, fileName) {
		try {
			// let data = await invoke('openFile_binary', { path: filePath })
			// Opening the file is slow in development because of serde
			// https://github.com/tauri-apps/tauri/issues/1817
			// To get around that I have to use invoke-http
			const data = await readBinaryFile(filePath)
			setFileBinary(data)
			// let f = new File([data], fileName, {
			//   type: "application/pdf"
			// })
			// document.documentViewer.openFile(f)
			// setDisplay("none")
		} catch (err) {
			console.log(err)
		}
	}

	async function openNextInQue() {
		const newBooks = [...books]
		newBooks.sort((a, b) => a.priority - b.priority)
		const nextBook = newBooks[Math.floor(Math.random() * 3)]
		await openFile(nextBook.filePath, nextBook.name)
	}

	// Syncs to local storage
	useEffect(() => {
		console.log(books)
		if (books.length === 0) {
			return
		}
		localStorage.setItem("books", JSON.stringify(books))
	}, [books])

	useEffect(() => {
		const books = JSON.parse(localStorage.getItem("books"))
		if (books !== null) {
			setBooks(books)
			console.log("books", books)
		}
	}, [])

	return (
		<DB.Provider value={[books, setBooks]}>
			<div className="container">
				{fileBinary.length === 0 ? (
					<FileList
						openNextInQue={openNextInQue}
						books={books}
						openFile={openFile}
					/>
				) : (
					<Reader
						openNextInQue={openNextInQue}
						key={fileBinary}
						fileBinary={fileBinary}
					/>
				)}
			</div>
		</DB.Provider>
	)
}
