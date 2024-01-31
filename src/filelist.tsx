import { AddDocumentDialog } from "./add_document.tsx"
import { Book, queIndex, books } from "./app.tsx"
import { signal } from "@preact/signals"

export const isDocumentDialogOpen = signal(false)

type FileListProps = {
	openNextInQue: () => void
}

export function FileList({ openNextInQue }: FileListProps) {
	function removeBook(index: number) {
		const newBooks = [...books.value]
		newBooks.splice(index, 1)
		books.value = newBooks
	}

	return (
		<div>
			<div style="display:flex;">
				<button
					style={books.value.length === 0 ? "display:none;" : ""}
					onClick={() => openNextInQue()}
				>
					Next in que
				</button>
				<button
					onClick={() => {
						isDocumentDialogOpen.value = true
					}}
				>
					Add
				</button>
			</div>
			<p>Files</p>
			<table className="file-list">
				<tr>
					<th>Title</th>
					<th>Added</th>
					<th>Progress</th>
					<th>Tags</th>
				</tr>
				{books.value.map((file: Book, index: number) => (
					<tr key={`row${index}`}>
						<th>
							<span
								onClick={() => {
									queIndex.value = index
								}}
							>
								{file.name}
							</span>
						</th>
						<th>1 day</th>
						<th>
							<progress
								max="100"
								value={
									(file.numberOfReadPages /
										file.readPages.length) *
									100
								}
							/>
						</th>
						<th>{file.tags.map((tag) => `${tag} `)}</th>
						<th>
							<button onClick={() => removeBook(index)}>
								remove
							</button>
						</th>
					</tr>
				))}
			</table>
			<AddDocumentDialog />
		</div>
	)
}
