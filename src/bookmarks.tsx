import { useState } from "preact/hooks"
import "./app.css"
// import Anki from "./anki"
import { Note } from "./note"

export default function Bookmark(props) {
	// const [dialogElement, _] = useState()
	const dialogElement = useState()

	function openDialog() {
		// TODO
	}

	return (
		<div className="bookmark">
			<p>{props.text}</p>
			<button>Add Note</button>
			<button onClick={openDialog}>Create Anki cards</button>
			{dialogElement[0]}
			<Note text={props.text} />
			<div id="markdown" />
		</div>
	)
}
