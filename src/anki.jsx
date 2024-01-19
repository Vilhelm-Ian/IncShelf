import { useState, useEffect } from "preact/hooks"
import { createRef } from "preact"
import "./app.css"
import { invoke, getFieldNames } from "./utils/anki_connect"
import cloze from "./utils/cloze"

export function Anki(props) {
	const [decks, setDecks] = useState([])
	const [currentDeck, setCurrentDeck] = useState("")
	const [currentModel, setCurrentModel] = useState("")
	const [fieldNames, setFieldNames] = useState([])
	const [modelTypes, setModelTypes] = useState([])
	const [fields, setFields] = useState({})
	const firstField = createRef()
	const dialog = createRef()

	useEffect(() => {
		if (props.isOpen === true) {
			dialog.current.showModal()
		} else {
			dialog.current.close()
		}
	}, [props.isOpen, dialog])

	useEffect(() => {
		invoke("deckNames", 6).then((res) => setDecks(res))
		async function getNamesAndFields() {
			const modelTypesResult = await invoke("modelNames", 6)
			setModelTypes(modelTypesResult)
			const fieldNames = await getFieldNames(modelTypesResult[0])
			setFieldNames(fieldNames)
		}
		getNamesAndFields()
	}, [])

	useEffect(() => {
		if (fieldNames.length !== 0) {
			updateFields(fieldNames[0], props.content)
			console.log("hi mom")
			firstField.current.innerText = props.content
		}
	}, [props.content, fieldNames, firstField])

	useEffect(() => {
		const keyDownHandler = (event) => {
			if (event.ctrlKey && event.shiftKey && event.key === "M") {
				cloze()
				console.log("detected")
			}
		}
		document.addEventListener("keydown", keyDownHandler)
		return () => {
			document.removeEventListener("keydown", keyDownHandler)
		}
	}, [fieldNames, firstField])

	async function updateCurrentModel(modelType) {
		setCurrentModel(modelType)
		const fieldNames = await getFieldNames(modelType)
		setFieldNames(fieldNames)
	}

	function send() {
		console.log(fields)
		invoke("addNote", 6, {
			note: {
				deckName: currentDeck,
				modelName: currentModel,
				fields,
			},
		})
			.then((res) => console.log(res))
			.catch((err) => console.log(err))
	}

	function updateFields(field, content) {
		setFields((old) => {
			const temp = { ...old }
			temp[field] = content
			return temp
		})
	}

	return (
		<dialog className="anki" ref={dialog}>
			<button onClick={() => props.setIsAnkiOpen(false)}>Close</button>
			<label htmlFor="decks">Choose a deck</label>
			<select
				onChange={(e) => setCurrentDeck(e.target.value)}
				name="decks"
			>
				{decks.map((deck,index) => (
					<option key={`deck${index}`} value={deck}>{deck}</option>
				))}
			</select>
			<label htmlFor="note_types">Choose a note typ</label>
			<select
				onChange={(e) => updateCurrentModel(e.target.value)}
				name="note_typese"
			>
				{modelTypes.map((noteType, index) => (
					<option key={`noteTyp${index}`} value={noteType}>{noteType}</option>
				))}
			</select>
			{fieldNames.map((field, index) => {
				return (
					<div key={`field${index}`}>
						<label>{field}</label>
						<span
							ref={index === 0 ? firstField : () => { }}
							name="field"
							onInput={(e) =>
								updateFields(
									field,
									e.currentTarget.textContent
								)
							}
							contentEditable
							role="textbox"
						/>
					</div>
				)
			})
			}
			<p>{props.text}</p>
			<button onClick={send}>Add</button>
		</dialog>
	)
}
