import { useState, useContext } from "preact/hooks"
import { AddDocumentDialog } from "./add_document"
import { DB } from "./app"

export function FileList(props) {
	const [isOpening, setIsOpening] = useState(false)
	// TODO use react context provider to sync que
	const books = useContext(DB)[0]

	function showDialog() {
		document.getElementById("add_document_dialog").showModal()
	}

	async function openNext(callback) {
		setIsOpening(true)
		await callback() // props.openNext_in_que()
		setIsOpening(false)
	}

	return (
		<div>
			{isOpening ? (
				<div className="loader" />
			) : (
				<div>
					<button onClick={() => openNext(props.openNext_in_que)}>
						Next in que
					</button>
					<button onClick={() => showDialog()}>Add</button>
					<p>Files</p>
					<table>
						<tr>
							<th>Title</th>
							<th>Added</th>
							<th>Progress</th>
							<th>Tags</th>
						</tr>
						{books.map((file, index) => (
							<tr key={`row${index}`}>
								<th>
									<input type="checkbox" />
									<span
										onClick={() =>
											openNext(() =>
												props.openFile(
													file.file_path,
													file.name
												)
											)
										}
									>
										{file.name}
									</span>
								</th>
								<th>1 day</th>
								<th>
									<progress
										id="file"
										max="100"
										value={file.priority}
									 />
								</th>
								<th>{file.tags}</th>
							</tr>
						))}
					</table>
					<AddDocumentDialog />
				</div>
			)}
		</div>
	)
}
