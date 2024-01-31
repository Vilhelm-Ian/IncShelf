import "./app.css"
import { books, queIndex } from "./app.tsx"
import { useEffect, useState } from "preact/hooks"
import { Reader } from "./reader.tsx"

export function Viewer({ openNextInQue, setQue }) {
	const [isBook, setIsBook] = useState(false)

	useEffect(() => {
		if (books.value[queIndex.value].name.match(/\.pdf/) !== null) {
			setIsBook(true)
		}
	}, [])

	async function nextBook() {
		const newBooks = [...books.value]
		newBooks[queIndex.value].timesRead += 1
		books.value = newBooks
		setQue((oldQue) => {
			const newQue = [...oldQue]
			const indexInQue = newQue.indexOf(queIndex.value)
			newQue.splice(indexInQue, 1)
			openNextInQue(newQue)
			if (newQue.length === 0) {
				queIndex.value = 0
			}
			return newQue
		})
	}

	return (
		<div>
			{isBook ? (
				<Reader setQue={setQue} openNextInQue={openNextInQue} />
			) : (
				<></>
			)}
			<div className="notes">
				<button onClick={() => nextBook()}>Next in que</button>
			</div>
		</div>
	)
}
