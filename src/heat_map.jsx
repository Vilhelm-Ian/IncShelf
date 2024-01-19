import "./app.css"
import { observer } from "./reader"

export function HeatMap(props) {
	function gotoPage(e) {
		observer.value.disconnect()
		document.documentViewer.documentHandler.goToPage(
			e.target.attributes.page.value
		)
		observer.value.observe_all_pages()
	}

	function renderHeatMap() {
		let currentPage = 0
		return (new Array(
			props.pages + Math.floor(props.pages / 25)
		)
			.fill(0))
			.map((_, index) => {
				if (index % 25 !== 0) {
					currentPage += 1
				}
				return index % 26 === 0 ? (
					<span key={`page${index}`}>
						{`${currentPage  }-${  Number(currentPage + 25)}`}
					</span>
				) : (
					<div
						page={currentPage}
						className={
							`${props.readPages[index] ? "read_page " : ""  }tooltip`
						}
						onClick={(e) => gotoPage(e)}
						key={`page${index}`}
					>
						{currentPage}
						<span className="tooltiptext">{currentPage}</span>
					</div>
				)
			})
	}

	return <div className="heat_map">{renderHeatMap()}</div>
}
