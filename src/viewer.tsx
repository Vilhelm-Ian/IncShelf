import "./app.css"
import { currentItem } from "./app.tsx"
import { Reader } from "./reader.tsx"
import { isBook, isNote } from "./db.ts"
import { Note } from "./note.tsx"

export function Viewer({ openNextInQue }) {
	return (
		<div>
			{isBook(currentItem.value) ? (
				<Reader openNextInQue={openNextInQue} />
			) : (
				<></>
			)}
			{isNote(currentItem.value) ? (
				<Note openNextInQue={openNextInQue} />
			) : (
				<></>
			)}
		</div>
	)
}
