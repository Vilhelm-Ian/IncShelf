export function TopBar({ documentViewer }) {
	return (
		<div id="grid-menubar">
			<div class="menu">
				<div class="menu-button" />
				<div class="menu-popup">
					<div
						onClick={() =>
							document.getElementById("open-file-input").click()
						}
					>
						Open File...
					</div>
				</div>
			</div>
			<div class="menu">
				<div class="menu-button" />
				<div class="menu-popup">
					<div onClick={() => documentViewer.showSearchBox()}>
						Search...
					</div>
				</div>
			</div>
			<div class="menu">
				<div class="menu-button" />
				<div class="menu-popup">
					<div onClick={() => documentViewer.toggleFullscreen()}>
						Fullscreen
					</div>
					<div onClick={() => documentViewer.toggleOutline()}>
						Outline
					</div>
					<hr />
					<div onClick={() => documentViewer?.setZoom(50)}>50%</div>
					<div onClick={() => documentViewer?.setZoom(75)}>
						75% (72 dpi)
					</div>
					<div onClick={() => documentViewer?.setZoom(100)}>
						100% (96 dpi)
					</div>
					<div onClick={() => documentViewer?.setZoom(125)}>125%</div>
					<div onClick={() => documentViewer?.setZoom(150)}>150%</div>
					<div onClick={() => documentViewer?.setZoom(200)}>200%</div>
				</div>
			</div>
		</div>
	)
}
