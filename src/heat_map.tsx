import "./app.css"
import { observer } from "./reader.tsx"

type HeatMapProps = {
	pages: number
	readPages: boolean[]
	documentViewer: any
}

export function HeatMap({ pages, readPages, documentViewer }: HeatMapProps) {
	function gotoPage(index: number) {
		observer.value?.disconnect()
		documentViewer?.documentHandler.goToPage(index)
		observer.value?.observe_all_pages()
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
	return <div className="heat-map">{renderHeatMap()}</div>
}
