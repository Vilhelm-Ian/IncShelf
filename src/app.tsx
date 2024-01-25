import { useState, useEffect, StateUpdater } from "preact/hooks"
import "./app.css"
import { FileList } from "./filelist.tsx"
import { Reader } from "./reader.tsx"
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
	timesRead: number
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

const priorityWeight = 0.6
const pagesReadWeight = 0.2
const timesReadWeight = 0.2

export const DB = createContext<
	[Book[], StateUpdater<Book[]>, number, StateUpdater<number>] | undefined
>(undefined)

export function App() {
	const [que, setQue] = useState([])
	const [books, setBooks] = useState<Book[]>([])
	const [index, setIndex] = useState(null)
	const error = signal("")

	function openNextInQue(newQue = que) {
		setIndex(newQue[0])
	}

	// Syncs to local storage
	useEffect(() => {
		if (books.length === 0) {
			return
		}
		localStorage.setItem("books", JSON.stringify(books))
	}, [books])

	useEffect(() => {
		localStorage.setItem("que", JSON.stringify(que))
	}, [que])

	useEffect(() => {
		const books = JSON.parse(localStorage.getItem("books"))
		const que = JSON.parse(localStorage.getItem("que"))
		if (books !== null) {
			setBooks(books)
		}
		if (que !== null) {
			setQue(() =>
				Array(books.length - 1)
					.fill(0)
					.map((_, index) => index)
			)
		}
		sortBooks()
	}, [])

	function sortBooks() {
		setBooks((oldBooks) => {
			const newBooks = [...oldBooks]
			const minMaxValue = getMinMaxValues(newBooks)
			newBooks.sort((a: Book, b: Book) => {
				const aScore = getBookScore(a, minMaxValue)
				const bScore = getBookScore(b, minMaxValue)
				return aScore - bScore
			})
			return newBooks
		})
	}

	function getBookScore(book: Book, minMaxValues: number[]) {
		const [
			minPriority,
			maxPriority,
			minReadPages,
			maxReadPages,
			minTimesRead,
			maxTimesRead,
		] = minMaxValues
		let priorityScore =
			normalize(book.priority, minPriority, maxPriority) * priorityWeight
		let readPagesScore =
			normalize(book.numberOfReadPages, minReadPages, maxReadPages) *
			pagesReadWeight
		let timesReadScore =
			normalize(book.timesRead, minTimesRead, maxTimesRead) *
			timesReadWeight
		readPagesScore = Number.isNaN(readPagesScore) ? 0 : readPagesScore
		priorityScore = Number.isNaN(priorityScore) ? 0 : priorityScore
		timesReadScore = Number.isNaN(timesReadScore) ? 0 : timesReadScore
		return priorityScore + readPagesScore + timesReadScore
	}

	function getMinMaxValues(
		books: Book[]
	): [number, number, number, number, number, number] {
		let [
			minPriority,
			maxPriority,
			minReadPages,
			maxReadPages,
			minTimesRead,
			maxTimesRead,
		] = [Infinity, 0, Infinity, 0, Infinity, 0]
		for (const book of books) {
			if (book.priority < minPriority) {
				minPriority = book.priority
			} else if (book.priority > maxPriority) {
				maxPriority = book.priority
			}
			if (book.numberOfReadPages < minReadPages) {
				minReadPages = book.numberOfReadPages
			} else if (book.priority > maxReadPages) {
				maxReadPages = book.numberOfReadPages
			}
			if (book.timesRead < minTimesRead) {
				minTimesRead = book.timesRead
			} else if (book.timesRead > maxTimesRead) {
				maxTimesRead = book.timesRead
			}
		}
		return [
			minPriority,
			maxPriority,
			minReadPages,
			maxReadPages,
			minTimesRead,
			maxTimesRead,
		]
	}

	function normalize(
		value: number,
		minValue: number,
		maxValue: number
	): number {
		return (value - minValue) / (maxValue - minValue)
	}

	return (
		<DB.Provider value={[books, setBooks, index, setIndex]}>
			<div className="container">
				<p>{error.value}</p>
				{index === null ? (
					<FileList openNextInQue={openNextInQue} />
				) : (
					<Reader
						setQue={setQue}
						openNextInQue={openNextInQue}
						key={index}
					/>
				)}
			</div>
		</DB.Provider>
	)
}
