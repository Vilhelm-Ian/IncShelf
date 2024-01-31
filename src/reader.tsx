import { useState, useEffect, StateUpdater } from "preact/hooks"
import { signal } from "@preact/signals"
import { createRef } from "preact"
import "./app.css"
import { HeatMap } from "./heat_map.tsx"
import { ContextMenu } from "./context_menu.tsx"
import { getPosition } from "./utils/get_position.ts"
import { MupdfDocumentViewer } from "../mupdf-view-page.js"
import { mupdfView } from "../mupdf-view.js"
import { books, queIndex } from "./app.tsx"
import { readBinaryFile, exists } from "@tauri-apps/api/fs"
import { TopBar } from "./topbar.tsx"

export const observer = signal(undefined)
export const pages = signal(0)
const error = signal("")
export const currentPage = signal(0)

type ReaderProps = {
	openNextInQue: (que: number[]) => void
	setQue: StateUpdater<number[]>
}

export function Reader({ openNextInQue, setQue }: ReaderProps) {
	const [mousePosition, setMousePosition] = useState(undefined)
	const [isLoading, setLoading] = useState(true)
	const [documentViewer, setDocumentViewer] = useState(undefined)
	const placeholder = createRef()
	const [selection, setSelection] = useState(undefined)

	useEffect(() => {
		observer.value = new PageObserver(markPageAsRead)
		;(async () => {
			try {
				if (!(await exists(books.value[queIndex.value].filePath))) {
					throw new Error("file dosen't exist")
				}
				const newDocumentViewer = new MupdfDocumentViewer(mupdfView)
				setDocumentViewer(newDocumentViewer)
				const data = await readBinaryFile(
					books.value[queIndex.value].filePath
				)
				const f = new File([data], "todo", {
					type: "application/pdf",
				})
				await newDocumentViewer.openFile(f)
				// eslint-disable-next-line
				pages.value = newDocumentViewer.documentHandler.pageCount
				newDocumentViewer.documentHandler.goToPage(
					books.value[queIndex.value].lastReadPage
				)
				observer.value.observeAllPages()
				setDocumentViewer(newDocumentViewer)
				setLoading(false)
			} catch (err) {
				if (err.message !== undefined) {
					error.value = err.message
				} else {
					error.value = err
				}
			}
		})()
		return () => {
			observer.value.stopObserving()
		}
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
		// Basically if a user goes to a page we disconnect the observer from observing
		// And start observing after jumping a page
		// An issue with this approach is that all pages we be counted as entries
		// So if a user jumps from page 5 to page 10 and the book has 200 pages and
		// it will have 200 entries after observing again
		if (entries.length === pages.value) {
			return
		}
		const pagesScrolled = entries
			.filter(
				(entry) =>
					!entry.isIntersecting && entry.boundingClientRect.y < 0
			)
			.map((entry) =>
				Number(entry.target.querySelector("a").id.match(/\d+/)[0])
			)
		const newBooks = [...books.value]
		const newlyReadPages = pagesScrolled.filter(
			(page) => !newBooks[queIndex.value].readPages[page]
		)
		pagesScrolled.forEach((page) => {
			newBooks[queIndex.value].readPages[page] = true
		})
		newBooks[queIndex.value].lastReadPage = Math.max(...newlyReadPages)
		newBooks[queIndex.value].numberOfReadPages += newlyReadPages.length
		books.value = newBooks
	}

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
				<TopBar documentViewer={documentViewer} />

				<div id="reader">
					<div id="grid-sidebar">
						<ul id="outline" />
					</div>
					<div id="grid-main" class="sidebarHidden">
						<div id="pages" />
						<div ref={placeholder} id="placeholder">
							<div>Loading WASM, please wait...</div>
						</div>
					</div>
					<div
						id="search-dialog"
						class="dialog"
						style="display: none"
					/>
					<input
						type="file"
						id="open-file-input"
						style="display: none"
						accept=".pdf,.xps,application/pdf"
						onChange={(e) => {
							documentViewer.openFile(e.target.files[0])
						}}
					/>
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
