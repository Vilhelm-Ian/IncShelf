import { useState, useEffect, useCallback } from "preact/hooks"
import { signal } from "@preact/signals"
import { createRef } from "preact"
import "./app.css"
import { HeatMap } from "./heat_map"
import { ContextMenu } from "./context_menu"
import { getPosition } from "./utils/get_position"


export const observer = signal()

export function Reader(props) {
	const [pagesNumber, setPagesNumber] = useState(null)
	const [readPages, setReadPages] = useState([])
	const [mousePosition, setMousePosition] = useState(undefined)
	const currentPage = 0
	const [isLoading, setLoading] = useState(false)
	observer.value = new IntersectionObserver(markPageAsRead)

	const documentViewer = createRef()
	const placeholder = createRef()
	const pages = createRef()
	const [selection, setSelection] = useState("")

	// const renderDocument = useCallback(async () => {
	// 	if (placeholder.current === null) {
	// 		return
	// 	}
	// 	console.log("we are here")
	// 	const pageCount =
	// 		document.documentViewer.documentHandler.pageCount + 1
	// 	setPagesNumber(pageCount)
	// 	trackVisibility()
	// }, [placeholder, props.fileBinary])
	const renderDocument = useCallback(async () => {
		const f = new File([props.fileBinary], "todo", {
			type: "application/pdf",
		})
		await document.documentViewer.openFile(f)
	}, [props.fileBinary])


	useEffect(() => {
		(async () => {
			document.documentViewer.placeholderDiv = document.getElementById("placeholder")
			document.documentViewer.viewerDivs.pagesDiv = document.getElementById("pages")
			renderDocument()
			const pageCount =
				document.documentViewer.documentHandler.pageCount + 1
			setPagesNumber(pageCount)
			observer.value.observe_all_pages = function() {
				const targets = document.querySelectorAll(".page")
				targets.forEach((target) => this.observe(target))
			}
			observer.value.observe_all_pages()
		})()
	}, [renderDocument])

	useEffect(() => {
		setReadPages(
			new Array(pagesNumber + Math.floor(pagesNumber / 25)).fill(false)
		)
	}, [pagesNumber])

	useEffect(() => {
		const pages = document.getElementById("pages")
		if (pages.current === null) {
			return
		}
		pages.addEventListener("mousedown", deselect)
		pages.addEventListener("mouseup", showContextMenu)
		return () => {
			pages.removeEventListener("mousedown", deselect)
			pages.removeEventListener("mouseup", showContextMenu)
		}
	}, [placeholder])

	function showContextMenu(e) {
		const currentSelection = document.getSelection().toString()
		if (currentSelection === "") {
			return
		}
		setMousePosition(getPosition(e))
		setSelection(currentSelection)
	}

	function deselect() {
		setMousePosition(undefined)
	}


	function markPageAsRead(entries) {
		const page = Number(
			entries[0].target.querySelector("a").id.match(/\d+/)[0]
		)
		if (entries[0].isIntersecting) {
			return
		}
		setReadPages((oldArray) => {
			const newArray = [...oldArray]
			newArray[page] = true
			return newArray
		})
	}

	async function nextBook() {
		setLoading(true)
		await props.open_next_in_que()
		setLoading(false)
	}


	return (
		<div>
			{isLoading ? (
				<div className="loader" />
			) : (
				<div className="container">
					<div id="grid-menubar">
						<div className="menu">
							<div className="menu-button">File</div>
							<div className="menu-popup">
								<div
									onClick={() =>
										document
											.getElementById("open-file-input")
											.click()
									}
								>
									Open File...
								</div>
							</div>
						</div>
						<div className="menu">
							<div className="menu-button">Edit</div>
							<div className="menu-popup">
								<div
									onClick={() =>
										documentViewer.showSearchBox()
									}
								>
									Search...
								</div>
							</div>
						</div>
						<div className="menu">
							<div className="menu-button">View</div>
							<div className="menu-popup">
								<div
									onClick={() =>
										document.documentViewer.toggleFullscreen()
									}
								>
									Fullscreen
								</div>
								<div
									onClick={() =>
										document.documentViewer.toggleOutline()
									}
								>
									Outline
								</div>
								<hr />
								<div
									onClick={() =>
										document.documentViewer?.setZoom(50)
									}
								>
									50%
								</div>
								<div
									onClick={() =>
										document.documentViewer?.setZoom(75)
									}
								>
									75% (72 dpi)
								</div>
								<div
									onClick={() =>
										document.documentViewer?.setZoom(100)
									}
								>
									100% (96 dpi)
								</div>
								<div
									onClick={() =>
										document.documentViewer?.setZoom(125)
									}
								>
									125%
								</div>
								<div
									onClick={() =>
										document.documentViewer?.setZoom(150)
									}
								>
									150%
								</div>
								<div
									onClick={() =>
										document.documentViewer?.setZoom(200)
									}
								>
									200%
								</div>
								<p>Hello</p>
								<input type="number" value={currentPage} />
							</div>
						</div>
					</div>
					<HeatMap
						readPages={readPages}
						pages={pagesNumber}
					/>
					<div id="reader">
						<div>{pagesNumber}</div>
						<div ref={pages} id="pages" />
						<div ref={placeholder} id="placeholder">
							<div>Loading WASM, please wait...</div>
						</div>
					</div>
					<div className="notes">
						<button onClick={() => nextBook()}>Next in que</button>
					</div>
					<ContextMenu position={mousePosition} content={selection} />
				</div>
			)}
		</div>
	)
}
