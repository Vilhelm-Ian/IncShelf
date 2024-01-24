import { useState, useEffect, useContext } from "preact/hooks"
import { signal } from "@preact/signals"
import { createRef } from "preact"
import "./app.css"
import { HeatMap } from "./heat_map.tsx"
import { ContextMenu } from "./context_menu.tsx"
import { getPosition } from "./utils/get_position.ts"
import { MupdfDocumentViewer } from "../mupdf-view-page.js"
import { mupdfView } from "../mupdf-view.js"
import { DB } from "./app.tsx"
import { readBinaryFile, exists } from "@tauri-apps/api/fs"

export const observer = signal(undefined)
export const pages = signal(0)
const error = signal("")

type ReaderProps = {
	openNextInQue: () => Promise<any>
}

export function Reader({ openNextInQue }: ReaderProps) {
	const [mousePosition, setMousePosition] = useState(undefined)
	const [isLoading, setLoading] = useState(true)
	const [documentViewer, setDocumentViewer] = useState(undefined)
	const [books, setBooks, index] = useContext(DB)

	observer.value =
		observer.value === undefined
			? new PageObserver(markPageAsRead)
			: observer.value

	const placeholder = createRef()
	const [selection, setSelection] = useState(undefined)

	useEffect(() => {
		;(async () => {
			try {
				if (!(await exists(books[index].filePath))) {
					throw new Error("file dosen't exist")
				}
				const newDocumentViewer = new MupdfDocumentViewer(mupdfView)
				setDocumentViewer(newDocumentViewer)
				const data = await readBinaryFile(books[index].filePath)
				const f = new File([data], "todo", {
					type: "application/pdf",
				})
				await newDocumentViewer.openFile(f)
				// eslint-disable-next-line
				pages.value = newDocumentViewer.documentHandler.pageCount
				newDocumentViewer.documentHandler.goToPage(
					books[index].lastReadPage
				)
				observer.value.observeAllPages()
				setDocumentViewer(newDocumentViewer)
				setLoading(false)
			} catch (err) {
				error.value = err
			}
		})()
	}, [])

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
		if (entries.length > 3) {
			return
		}
		const page = Number(
			entries[0].target.querySelector("a").id.match(/\d+/)[0]
		)
		if (books[index].readPages[page]) {
			return
		}
		setBooks((oldBooks) => {
			const newBooks = [...oldBooks]
			newBooks[index].readPages[page] = true
			newBooks[index].lastReadPage = page
			return newBooks
		})
	}

	async function nextBook() {
		setLoading(true)
		await openNextInQue()
		setLoading(false)
	}

	return (
		<div class="container">
			<>
				<p>{error.value}</p>
				{isLoading ? (
					<></>
				) : (
					<HeatMap documentViewer={documentViewer} />
				)}
				<div id="reader">
					<div id="pages" />
					<div ref={placeholder} id="placeholder">
						<div>Loading WASM, please wait...</div>
					</div>
				</div>
				<div className="notes">
					<button onClick={() => nextBook()}>Next in que</button>
				</div>
				<ContextMenu position={mousePosition} content={selection} />
			</>
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

export class PageObserver extends IntersectionObserver {
	observeAllPages = function () {
		this.observingAll = true
		const targets = document.querySelectorAll(".page")
		targets.forEach((target) => this.observe(target))
	}

	stopObserving = function () {
		this.disconnect()
		this.observingAll = false
	}
}
