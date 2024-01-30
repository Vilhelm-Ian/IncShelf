import { useEffect } from "preact/hooks"
import "./app.css"
import { observer, pages, PageObserver, currentPage } from "./reader.tsx"
import { books, queIndex } from "./app.tsx"
import { MupdfDocumentViewer } from "../mupdf-view-page.js"

type HeatMapProps = {
	documentViewer: MupdfDocumentViewer
}

export function HeatMap({ documentViewer }: HeatMapProps) {
	useEffect(() => {
		const currentPageObserver = new PageObserver(getCurrentPage, {
			threshold: 0.5,
		})
		currentPageObserver.observeAllPages()
		return () => {
			currentPageObserver.stopObserving()
		}
	}, [])

	function gotoPage(index: number) {
		observer.value.stopObserving()
		documentViewer.documentHandler.goToPage(index)
		currentPage.value = index
		observer.value.observeAllPages()
	}

	useEffect(() => {
		if (books.value[queIndex.value].readPages.length === 0) {
			books.value[queIndex.value].readPages = new Array(pages.value).fill(
				false
			)
		}
	}, [])

	function renderHeatMap() {
		return books.value[queIndex.value].readPages.map(
			(isRead: boolean, index: number) => {
				// eslint-disable-next-line
				return (
					<>
						{index % 25 === 0 ? (
							<span key={`label${index}`}>
								{`${index}-${Number(index + 25)}`}
							</span>
						) : (
							<></>
						)}
						<div
							className={`${isRead ? "read-page " : ""}tooltip`}
							style={`${currentPage.value === index ? "border: solid red;" : ""}`}
							onClick={() => gotoPage(index)}
							key={`page${index}`}
						>
							{index}
							<span className="tooltiptext">{index}</span>
						</div>
					</>
				)
			}
		)
	}

	function toggleObserving() {
		if (observer.value.observingAll) {
			observer.value.stopObserving()
		} else {
			observer.value.observeAllPages()
		}
	}

	function togglePageAsRead() {
		const newBooks = [...books.value]
		const currentBook = newBooks[queIndex.value]
		currentBook.readPages[currentPage.value] =
			!currentBook.readPages[currentPage.value]
		if (!currentBook.readPages[currentPage.value]) {
			currentBook.lastReadPage = currentPage.value
		}
		books.value = newBooks
	}

	return (
		<div>
			<div className="reading-options">
				<button
					onClick={() => {
						queIndex.value = null
					}}
				>
					Back
				</button>
				<button onClick={toggleObserving}>Toggle auto mark</button>
				<button onClick={togglePageAsRead}>Toggle page as read</button>
				<p>Current Page</p>
				<input value={currentPage.value} type="number" />
				<div class="heat-map">{renderHeatMap()}</div>
			</div>
		</div>
	)
}

function getCurrentPage(entries: IntersectionObserverEntry[]) {
	const mostDisplayedPage = findPageMostDisplayed(entries)
	const mostDisplayedPageNumber = Number(
		entries[mostDisplayedPage].target.querySelector("a").id.match(/\d+/)[0]
	)
	currentPage.value = mostDisplayedPageNumber
}

function findPageMostDisplayed(pages: IntersectionObserverEntry[]) {
	let result = {
		index: 0,
		value: 0,
	}
	pages.forEach(({ intersectionRatio }, index) => {
		result =
			intersectionRatio > result.value
				? { index, value: intersectionRatio }
				: result
	})
	return result.index
}
