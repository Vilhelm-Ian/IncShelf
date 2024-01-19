import { useState, useEffect, StateUpdater } from "preact/hooks"
import { createRef } from "preact"
import "./app.css"
import { invoke } from "./utils/anki_connect.ts"
import { ChangeEvent } from "preact/compat"
import { useSignal } from "@preact/signals"

type AnkiProps = {
	content: string
	isOpen: boolean
	setIsAnkiOpen: StateUpdater<boolean>
}

export function Anki({ content, isOpen, setIsAnkiOpen }: AnkiProps) {
	const [decks, setDecks] = useState([])
	const [currentDeck, setCurrentDeck] = useState("")
	const [currentModel, setCurrentModel] = useState("")
	const [fieldNames, setFieldNames] = useState<string[]>([])
	const [modelTypes, setModelTypes] = useState<string[]>([])
	const [fields, setFields] = useState(new Map())
	const dialog = createRef()
	const error = useSignal("")

	useEffect(() => {
		if (isOpen === true) {
			dialog.current.showModal()
		} else {
			dialog.current.close()
		}
	}, [isOpen, dialog])

	useEffect(() => {
		invoke("deckNames", 6).then((res) => setDecks(res))
		async function getNamesAndFields() {
			try {
				const modelTypesResult = await invoke("modelNames", 6)
				setModelTypes(modelTypesResult)
				setCurrentModel(modelTypesResult[0])
				const fieldNames = await invoke("modelFieldNames", 6, {
					modelName: modelTypesResult[0],
				})
				setFieldNames(fieldNames)
				setFields(fields.set(fieldNames[0], content))
			} catch (err) {
				error.value = `failed to connect with anki ${err}`
			}
		}
		getNamesAndFields()
	}, [])

	useEffect(() => {
		const keyDownHandler = (event: KeyboardEvent) => {
			if (event.ctrlKey && event.shiftKey && event.key === "M") {
				cloze()
			}
		}
		document.addEventListener("keydown", keyDownHandler)
		return () => {
			document.removeEventListener("keydown", keyDownHandler)
		}
	}, [fieldNames])

	async function updateCurrentModel(modelName: string) {
		try {
			setCurrentModel(modelName)
			const fieldNames = await invoke("modelFieldNames", 6, {
				modelName,
			})

			setFieldNames(fieldNames)
		} catch (err) {
			error.value = `failed to get fields of deck ${err}`
		}
	}

	async function send() {
		try {
			await invoke("addNote", 6, {
				note: {
					deckName: currentDeck,
					modelName: currentModel,
					fields: Object.fromEntries(fields),
				},
			})
		} catch (err) {
			error.value = err.message
		}
	}

	function updateFields(e: InputEvent, field: string) {
		if (!(e.currentTarget instanceof HTMLSpanElement)) {
			return
		}
		setFields(fields.set(field, e.currentTarget.innerText))
	}

	function setCurreentDeck(e: ChangeEvent) {
		if (e.currentTarget instanceof HTMLSelectElement) {
			setCurrentDeck(e.currentTarget.value)
		}
	}

	return (
		<dialog className="anki" ref={dialog}>
			<button onClick={() => setIsAnkiOpen(false)}>Close</button>
			<p>{error.value}</p>
			<label htmlFor="decks">Choose a deck</label>
			<select onChange={(e) => setCurreentDeck(e)} name="decks">
				{decks.map((deck, index) => (
					<option key={`deck${index}`} value={deck}>
						{deck}
					</option>
				))}
			</select>
			<label htmlFor="note_types">Choose a note typ</label>
			<select
				onChange={(e) => updateCurrentModel(e.currentTarget.value)}
				name="note_typese"
			>
				{modelTypes.map((noteType, index) => (
					<option key={`noteTyp${index}`} value={noteType}>
						{noteType}
					</option>
				))}
			</select>
			{fieldNames.map((field, index) => {
				return (
					<div class="anki-field" key={`field${index}`}>
						<label>{field}</label>
						<span
							name="field"
							onInput={(e) => updateFields(e, field)}
							contentEditable
							role="textbox"
						>
							{fields.get(field)}
						</span>
					</div>
				)
			})}
			<button onClick={send}>Add</button>
		</dialog>
	)
}

function cloze() {
	const selection = document.getSelection()
	const parent = selection.anchorNode.parentElement
	if (parent.attributes.name.value !== "field") {
		return
	}
	let text = selection.getRangeAt(0).extractContents().textContent
	text = `{{c1::${text}}}`
	const offset = selection.anchorOffset
	parent.innerHTML =
		parent.innerHTML.slice(0, offset) +
		text +
		parent.innerHTML.slice(offset)
}
