import { useEffect, useState } from "preact/hooks"
import "./app.css"
import { observer, PageObserver, currentPage } from "./reader.tsx"
import { currentItem, itemsQue } from "./app.tsx"
import { MupdfDocumentViewer } from "../mupdf-view-page.js"
import { Fragment } from "preact/jsx-runtime"

type HeatMapProps = {
	documentViewer: MupdfDocumentViewer
}

export function HeatMap({ documentViewer }: HeatMapProps) {
	const [isObserving, setIsObserving] = useState(true)

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

	function renderHeatMap() {
		return currentItem.value.readPages.map(
			(isRead: boolean, index: number) => {
				return (
					<Fragment key={`fragment${index}`}>
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
					</Fragment>
				)
			}
		)
	}

	function toggleObserving() {
		if (observer.value.observingAll) {
			setIsObserving(false)
			observer.value.stopObserving()
		} else {
			setIsObserving(true)
			observer.value.observeAllPages()
		}
	}

	function togglePageAsRead() {
		const newBooks = [...itemsQue.value]
		const currentBook = currentItem.value
		currentBook.readPages[currentPage.value] =
			!currentBook.readPages[currentPage.value]
		if (!currentBook.readPages[currentPage.value]) {
			currentBook.lastReadPage = currentPage.value
		}
		itemsQue.value = newBooks
	}

	return (
		<div>
			<div className="reading-options">
				<button
					onClick={() => {
						currentItem.value = null
					}}
				>
					Back
				</button>
				<button
					style="display:flex;justify-content:center;"
					onClick={toggleObserving}
				>
					<input type="checkbox" checked={isObserving} />
					Toggle auto mark
				</button>
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
