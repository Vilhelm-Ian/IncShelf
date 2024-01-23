import "./app.css"
import { observer } from "./reader.tsx"

type HeatMapProps = {
	pages: number
	readPages: boolean[]
	documentViewer: any
}

export function HeatMap({ pages, readPages, documentViewer }: HeatMapProps) {
	function gotoPage(index: number) {
		observer.value.stopObserving()
		documentViewer.documentHandler.goToPage(index)
		observer.value.observeAllPages()
	}

	function renderHeatMap() {
		let currentPage = 0
		return new Array(pages + Math.floor(pages / 25))
			.fill(0)
			.map((_, index) => {
				if (index % 25 !== 0) {
					currentPage += 1
				}
				const pageValue = currentPage
				return index % 26 === 0 ? (
					<span key={`page${index}`}>
						{`${currentPage}-${Number(currentPage + 25)}`}
					</span>
				) : (
					<div
						className={`${readPages[index] ? "read-page " : ""}tooltip`}
						onClick={() => gotoPage(pageValue)}
						key={`page${index}`}
					>
						{currentPage}
						<span className="tooltiptext">{currentPage}</span>
					</div>
				)
			})
	}

	function toggleObserving() {
		if (observer.value.observingAll) {
			observer.value.stopObserving()
		} else {
			observer.value.observeAllPages()
		}
	}

	return (
		<>
			<div className="reading-options">
				<button onClick={toggleObserving}>Toggle auto mark</button>
				<button />
			</div>
			<div className="heat-map">{renderHeatMap()}</div>
		</>
	)
}
