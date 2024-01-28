import { useContext } from "preact/hooks"
import { AddDocumentDialog } from "./add_document.tsx"
import { DB, Book } from "./app.tsx"
import { signal } from "@preact/signals"

export const isDocumentDialogOpen = signal(false)

type FileListProps = {
	openNextInQue: () => void
}

export function FileList({ openNextInQue }: FileListProps) {
	const [books, setBooks, _, setIndex] = useContext(DB)

	function removeBook(index: number) {
		setBooks((oldBooks) => {
			const newBooks = [...oldBooks]
			newBooks.splice(index, 1)
			return newBooks
		})
	}

	return (
		<div>
			<div>
				<button
					style={books.length === 0 ? "display:none;" : ""}
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
				<p>Files</p>
				<table>
					<tr>
						<th>Title</th>
						<th>Added</th>
						<th>Progress</th>
						<th>Tags</th>
					</tr>
					{books.map((file: Book, index: number) => (
						<tr key={`row${index}`}>
							<th>
								<input type="checkbox" />
								<span onClick={() => setIndex(index)}>
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
							<th>{file.tags}</th>
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
		</div>
	)
}
