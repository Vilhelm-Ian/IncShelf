import "./app.css"
import { itemsQue, currentItem } from "./app.tsx"
import { useEffect, useState } from "preact/hooks"
import { Reader } from "./reader.tsx"

export function Viewer({ openNextInQue }) {
	const [isBook, setIsBook] = useState(false)

	useEffect(() => {
		if (currentItem.value.name.match(/\.pdf/) !== null) {
			setIsBook(true)
		}
	}, [])

	return (
		<div>
			{isBook ? <Reader openNextInQue={openNextInQue} /> : <></>}
			<div className="notes" />
		</div>
	)
}
