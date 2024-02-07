import { AddDocumentDialog } from "./add_document.tsx"
import { Book, Note, itemsQue } from "./app.tsx"
import { signal } from "@preact/signals"
import { deleteItem, isBook } from "./db.ts"

export const isDocumentDialogOpen = signal(false)

type FileListProps = {
	openNextInQue: (index?: number) => void
}

export function FileList({ openNextInQue }: FileListProps) {
	async function removeBook(index: number) {
		await deleteItem(itemsQue.value[index])
		const newQue = [...itemsQue.value]
		newQue.splice(index, 1)
		itemsQue.value = newQue
	}

	function getProgress(item: Book | Note) {
		if (isBook(item)) {
			return (item.numberOfReadPages / item.readPages.length) * 100
		}
		return 100
	}

	return (
		<div>
			<div style="display:flex;">
				<button
					style={itemsQue.value.length === 0 ? "display:none;" : ""}
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
				{itemsQue.value.map((file: Book | Note, index: number) => (
					<tr key={`row${index}`}>
						<th>
							<span
								onClick={() => {
									openNextInQue(index)
								}}
							>
								{file.name}
							</span>
						</th>
						<th>1 day</th>
						<th>
							<progress max="100" value={getProgress(file)} />
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
