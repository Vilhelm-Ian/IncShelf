import "./app.css"
import { useEffect, useState } from "preact/hooks"
import { createRef } from "preact"
import { Position } from "./utils/get_position.ts"
import { Anki } from "./anki.tsx"
import { Note } from "./note.tsx"

type ContextMenuProps = {
	position: Position
	content: string
}

export function ContextMenu({ position, content }: ContextMenuProps) {
	const [isAnkiOpen, setIsAnkiOpen] = useState(false)
	const [isEditorOpen, setIsEditorOpen] = useState(false)
	const contextMenu = createRef()
	const [visibility, setVisibility] = useState("hidden")
	const [top, setTop] = useState(0)
	const [left, setLeft] = useState(0)

	useEffect(() => {
		if (position !== undefined && content !== undefined) {
			setTop(position.y)
			setLeft(position.x)
			setVisibility("visible")
		} else {
			setVisibility("hidden")
		}
	}, [position, content])

	useEffect(() => {
		if (isAnkiOpen || isEditorOpen) {
			setVisibility("hidden")
		}
	}, [isAnkiOpen, isEditorOpen])

	return (
		<div ref={contextMenu}>
			<ul
				style={`visibility: ${visibility}; top: ${top}px; left: ${left}px;`}
				class="context-menu"
			>
				<li onClick={() => setIsEditorOpen(true)}>Add Note</li>
				<li onClick={() => setIsAnkiOpen(true)}>Create Anki Card</li>
				<li>X-Ray(not yet implemented)</li>
				<li>Definition(not yet implemented)</li>
				<li>Translate(not yet implemented)</li>
			</ul>
			{isAnkiOpen ? (
				<Anki
					content={content}
					isOpen={isAnkiOpen}
					setIsAnkiOpen={setIsAnkiOpen}
				/>
			) : (
				<></>
			)}
			{isEditorOpen ? (
				<Note
					content={content}
					isOpen={isEditorOpen}
					setIsEditorOpen={setIsEditorOpen}
				/>
			) : (
				<></>
			)}
		</div>
	)
}
