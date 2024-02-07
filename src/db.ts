import Database from "tauri-plugin-sql-api"
import { Book, Note } from "./app.tsx"

export const db = await Database.load("sqlite:documents.db")

;(async () => {
	await db.execute(
		"CREATE TABLE books (id INTEGER, name TEXT, filePath TEXT, priority INTEGER, readPages TEXT, inQue INTEGER, lastReadPage INTEGER, tags TEXT, numberOfReadPages INTEGER, timesRead INTEGER)"
	)
	// console.log(result)
})()

;(async () => {
	await db.execute(
		"create TABLE notes (id integer, name text, filepath text, priority integer, inque integer, tags text, timesread integer)"
	)
})()

;(async () => {
	await db.execute("create TABLE que (id integer, name text, score integer)")
})()

export function updatePriorities(items: Book[] | Note[]) {
	items.forEach(async (item: Book | Note, index: number) => {
		const table = getTable(item.name)
		await db.execute(`UPDATE ${table} SET priority = $1 WHERE name = $2`, [
			index,
			item.name,
		])
	})
}

export async function deleteItem(item: Book | Note) {
	const table = getTable(item.name)
	const res = await db.execute(`DELETE FROM ${table} WHERE name = $1;`, [
		item.name,
	])
	return res
}

export async function getAllItems() {
	const books: (Book | Note)[] = await db.select(
		'SELECT name, filePath, numberOfReadPages, priority, timesRead, readPages, tags from books WHERE inQue = "true"'
	)
	const notes: Note[] = await db.select(
		'SELECT name, filePath, priority, tags from notes WHERE inQue = "true"'
	)
	let items = books.concat(notes)
	items = items.map((item: Book | Note) => {
		item.tags = JSON.parse(String(item.tags))
		if (isBook(item)) {
			item.readPages = JSON.parse(String(item.readPages))
		}
		return item
	})
	return items
}

export async function getLastReadPage(name: string) {
	const res = await db.select(
		"SELECT lastReadPage from books WHERE name = $1",
		[name]
	)
	return res[0].lastReadPage
}

export async function incrementTimesRead(name: string) {
	const table = getTable(name)
	db.execute(
		`UPDATE ${table} SET timesRead = timesRead + 1 WHERE name = $1`,
		[name]
	)
}

export async function addBook(book: Book) {
	await db.execute(
		"INSERT into books (name, filePath, priority, readPages, inQue, lastReadPage, tags, numberOfReadPages, timesRead) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
		[
			book.name,
			book.filePath,
			book.priority,
			book.readPages,
			book.inQue,
			book.lastReadPage,
			book.tags,
			book.numberOfReadPages,
			book.timesRead,
		]
	)
}

export async function generateReadPages(book: Book, numberOfPages: number) {
	if (book.readPages.length === 0) {
		const readPages = new Array(numberOfPages).fill(false)
		book.readPages = readPages
		await db.execute("UPDATE books SET readPages = $1 WHERE name = $2", [
			JSON.stringify(readPages),
			book.name,
		])
	}
}

function getTable(name: string) {
	let table: string
	if (name.includes(".pdf")) {
		table = "books"
	} else if (name.includes(".md")) {
		table = "notes"
	}
	return table
}

export function isBook(item: Book | Note): item is Book {
	return item.name.includes(".pdf")
}

export function isNote(item: Book | Note): item is Note {
	return item.name.includes(".md")
}
