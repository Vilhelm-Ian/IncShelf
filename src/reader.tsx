import { useState, useEffect } from "preact/hooks"
import { signal } from "@preact/signals"
import { createRef } from "preact"
import "./app.css"
import { HeatMap } from "./heat_map.tsx"
import { ContextMenu } from "./context_menu.tsx"
import { getPosition } from "./utils/get_position.ts"
import { MupdfDocumentViewer } from "../mupdf-view-page.js"
import { mupdfView } from "../mupdf-view.js"

export const observer = signal(undefined)

type ReaderProps = {
	fileBinary: Uint8Array
	openNextInQue: () => Promise<any>
}

export function Reader({ fileBinary, openNextInQue }: ReaderProps) {
	const [pagesNumber, setPagesNumber] = useState(null)
	const [readPages, setReadPages] = useState([])
	const [mousePosition, setMousePosition] = useState(undefined)
	const [isLoading, setLoading] = useState(false)
	const [documentViewer, setDocumentViewer] = useState(undefined)
	observer.value =
		observer.value === undefined
			? new IntersectionObserver(markPageAsRead)
			: observer.value

	const placeholder = createRef()
	const pages = createRef()
	const [selection, setSelection] = useState(undefined)

	useEffect(() => {
		// TODO handle failure
		;(async () => {
			const newDocumentViewer = new MupdfDocumentViewer(mupdfView)
			const f = new File([fileBinary], "todo", {
				type: "application/pdf",
			})
			await newDocumentViewer.openFile(f)
			const pageCount = newDocumentViewer.documentHandler.pageCount
			setPagesNumber(pageCount)
			observer.value.observeAllPages = function () {
				this.observingAll = true
				const targets = document.querySelectorAll(".page")
				targets.forEach((target) => this.observe(target))
			}
			observer.value.stopObserving = function () {
				this.disconnect()
				this.observingAll = false
			}
			observer.value.observeAllPages()
			setDocumentViewer(newDocumentViewer)
		})()
	}, [])

	useEffect(() => {
		setReadPages(
			new Array(pagesNumber + Math.floor(pagesNumber / 25)).fill(false)
		)
	}, [pagesNumber])

	useEffect(() => {
		const pages = document.getElementById("pages")
		pages.addEventListener("mousedown", deselect)
		pages.addEventListener("mouseup", showContextMenu)
		return () => {
			pages.removeEventListener("mousedown", deselect)
			pages.removeEventListener("mouseup", showContextMenu)
		}
	}, [placeholder])

	function showContextMenu(e: MouseEvent) {
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

	function markPageAsRead(entries: IntersectionObserverEntry[]) {
		if (entries[0].isIntersecting || entries[0].boundingClientRect.y > 0) {
			return
		}
		// Basically if a user goes to a page we disconnect the observer from observing
		// And start observing after jumping a page
		// An issue with this approach is that all pages we be counted as entries
		// So if a user jumps from page 5 to page 10 and the book has 200 pages and
		// it will have 200 entries after observing again
		if (entries.length > 10) {
			return
		}
		const page = Number(
			entries[0].target.querySelector("a").id.match(/\d+/)[0]
		)
		setReadPages((oldArray) => {
			const newArray = [...oldArray]
			newArray[page] = true
			return newArray
		})
	}

	async function nextBook() {
		setLoading(true)
		await openNextInQue()
		setLoading(false)
	}

	return (
		<div class="container">
			{isLoading ? (
				<div className="loader" />
			) : (
				<>
					<HeatMap
						documentViewer={documentViewer}
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
				</>
			)}
		</div>
	)
}

// function renderPdf(binary: Uint8Array) {
// 	let params = new URLSearchParams(window.location.search)

// 	let documentViewer = new MupdfDocumentViewer(mupdfView)

// 	mupdfView.ready
// 		.then(function() {
// 			if (params.has("file")) {
// 				documentViewer.openURL(
// 					params.get("file"),
// 					params.get("progressive") | 0,
// 					params.get("prefetch") | 0
// 				)
// 			} else {
// 				documentViewer.openEmpty()
// 			}
// 		})
// 		.catch(function(error) {
// 			documentViewer.showDocumentError("Load", error)
// 		})

// 	window.addEventListener("keydown", function(event: KeyboardEvent) {
// 		if (event.key === "Escape") {
// 			documentViewer.hideSearchBox()
// 		}

// 		if (event.ctrlKey || event.metaKey) {
// 			switch (event.key) {
// 				case "+" || "=":
// 					documentViewer.zoomIn()
// 					event.preventDefault()
// 					break
// 				case "-":
// 					documentViewer.zoomOut()
// 					event.preventDefault()
// 					break
// 				case "0":
// 					documentViewer.setZoom(100)
// 					break
// 				case "F":
// 					event.preventDefault()
// 					documentViewer.showSearchBox()
// 					break
// 				case "G":
// 					event.preventDefault()
// 					documentViewer.showSearchBox()
// 					runSearch(event.shiftKey ? -1 : 1)
// 					break
// 			}
// 		}
// 	})
// }
