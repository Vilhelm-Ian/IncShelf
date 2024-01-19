import "./app.css"
import { Anki } from "./anki"
import { Note } from "./note"
import { useEffect, useState } from "preact/hooks"
import { createRef } from "preact"

export function ContextMenu(props) {
	const [isAnkiOpen, setIsAnkiOpen] = useState(false)
	const [isEditorOpen, setIsEditorOpen] = useState(false)
	const contextMenu = createRef()

	useEffect(() => {
		if (props.position !== undefined) {
			contextMenu.current.style.visibility = "visible"
			contextMenu.current.style.top = `${props.position.y  }px`
			contextMenu.current.style.left = `${props.position.x  }px`
		} else {
			contextMenu.current.style.visibility = "hidden"
		}
	}, [props.position, contextMenu])

	return (
		<>
			<ul ref={contextMenu} className="contextMenu">
				<li onClick={() => setIsEditorOpen(true)}>Add Note</li>
				<li onClick={() => setIsAnkiOpen(true)}>Create Anki Card</li>
				<li>X-Ray(not yet implemented)</li>
				<li>Definition(not yet implemented)</li>
				<li>Translate(not yet implemented)</li>
			</ul>
			{isAnkiOpen ? (
				<Anki
					content={props.content}
					isOpen={isAnkiOpen}
					setIsAnkiOpen={setIsAnkiOpen}
				/>
			) : (
				<></>
			)}
			{isEditorOpen ? (
				<Note
					content={props.content}
					isOpen={isEditorOpen}
					setIsEditorOpen={setIsEditorOpen}
				/>
			) : (
				<></>
			)}
		</>
	)
}
