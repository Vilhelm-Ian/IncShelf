import { useState, useEffect } from "preact/hooks"
import { signal } from "@preact/signals"
import { createRef } from "preact"
import "./app.css"
import { HeatMap } from "./heat_map.tsx"
import { ContextMenu } from "./context_menu.tsx"
import { getPosition } from "./utils/get_position.ts"
import { MupdfDocumentViewer } from "../mupdf-view-page.js"
import { mupdfView } from "../mupdf-view.js"
import { currentItem } from "./app.tsx"
import { readBinaryFile, exists } from "@tauri-apps/api/fs"
import { TopBar } from "./topbar.tsx"
import {
	db,
	generateReadPages,
	getLastReadPage,
	incrementTimesRead,
} from "./db.ts"

export const observer = signal(undefined)
export const pages = signal(0)
const error = signal("")
export const currentPage = signal(0)

type ReaderProps = {
	openNextInQue: (index?: number) => void
}

export function Reader({ openNextInQue }: ReaderProps) {
	const [mousePosition, setMousePosition] = useState(undefined)
	const [isLoading, setLoading] = useState(true)
	const [documentViewer, setDocumentViewer] = useState(undefined)
	const placeholder = createRef()
	const [selection, setSelection] = useState(undefined)

	useEffect(() => {
		observer.value = new PageObserver(markPageAsRead)
		let handleKeyDown
		;(async () => {
			try {
				if (!(await exists(currentItem.value.filePath))) {
					throw new Error("file dosen't exist")
				}
				const newDocumentViewer = new MupdfDocumentViewer(mupdfView)
				setDocumentViewer(newDocumentViewer)
				const data = await readBinaryFile(currentItem.value.filePath)
				const f = new File([data], "todo", {
					type: "application/pdf",
				})
				await newDocumentViewer.openFile(f)
				// eslint-disable-next-line
				const pageCount = newDocumentViewer.documentHandler.pageCount
				pages.value = pageCount
				await generateReadPages(currentItem.value, pageCount)
				const lastReadPage = await getLastReadPage(
					currentItem.value.name
				)
				await incrementTimesRead(currentItem.value.name)
				newDocumentViewer.documentHandler.goToPage(lastReadPage)
				observer.value.observeAllPages()
				handleKeyDown = (e: KeyboardEvent) => {
					readerShortcuts(e, newDocumentViewer)
				}
				window.addEventListener("keydown", handleKeyDown)
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
			window.removeEventListener("keydown", handleKeyDown)
		}
	}, [])

	useEffect(() => {
		// TODO potential performance issue use ref instead
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

	async function markPageAsRead(entries: IntersectionObserverEntry[]) {
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
		const newlyReadPages = pagesScrolled.filter(
			(page) => !currentItem.value.readPages[page]
		)
		const result = await db.select(
			"SELECT readPages, numberOfReadPages from books WHERE name = $1",
			[currentItem.value.name]
		)
		result[0].readPages = JSON.parse(result[0].readPages)
		pagesScrolled.forEach((page) => {
			currentItem.value.readPages[page] = true
			result[0].readPages[page] = true
		})
		const jsonReadPages = JSON.stringify(result[0].readPages)
		await db.execute(
			"UPDATE books SET readPages = $1, numberOfReadPages = $2 WHERE name = $3",
			[
				jsonReadPages,
				result[0].numberOfReadPages + newlyReadPages.length,
				currentItem.value.name,
			]
		)
		currentItem.value.numberOfReadPages += newlyReadPages.length
		if (newlyReadPages.length > 0) {
			currentItem.value.lastReadPage = Math.max(...newlyReadPages)
			await db.execute(
				"UPDATE books SET lastReadPage = $1 WHERE name = $2",
				[Math.max(...newlyReadPages), currentItem.value.name]
			)
		}
	}

	async function nextBook() {
		openNextInQue()
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

function readerShortcuts(event: KeyboardEvent, documentViewer) {
	if (event.key === "Escape") {
		documentViewer.hideSearchBox()
	}

	if (event.ctrlKey || event.metaKey) {
		switch (event.key) {
			case "+" || "=":
				documentViewer.zoomIn()
				event.preventDefault()
				break
			case "-":
				documentViewer.zoomOut()
				event.preventDefault()
				break
			case "0":
				documentViewer.setZoom(100)
				break
			case "f":
				event.preventDefault()
				documentViewer.showSearchBox()
				break
			case "g":
				event.preventDefault()
				documentViewer.showSearchBox()
				documentViewer.runSearch(event.shiftKey ? -1 : 1)
				break
		}
	}
}

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
