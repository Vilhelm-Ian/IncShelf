import "./app.css"
import { FileList } from "./filelist.tsx"
import { signal } from "@preact/signals"
import { Viewer } from "./viewer.tsx"
import { getAllItems } from "./db.ts"
import { sortItems } from "./utils/score.ts"

export const itemsQue = signal([])
export const currentItem = signal(null)

generateQue()

export function App() {
	async function openNextInQue(index = 0) {
		currentItem.value = itemsQue.value[index]
		itemsQue.value.splice(index, 1)
		if (itemsQue.value.length === 0) {
			await generateQue()
		}
	}

	return (
		<div className="container">
			{currentItem.value === null ? (
				<FileList openNextInQue={openNextInQue} />
			) : (
				<Viewer key={currentItem.value} openNextInQue={openNextInQue} />
			)}
		</div>
	)
}

export async function generateQue() {
	const items = await getAllItems()
	itemsQue.value = sortItems(items)
}

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

export type Note = {
	name: string
	filePath: string
	priority: number
	inQue: boolean
	tags: string[]
	timesRead: number
}
