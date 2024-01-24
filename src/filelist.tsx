import { useState, useContext, useEffect } from "preact/hooks"
import { AddDocumentDialog } from "./add_document.tsx"
import { DB, Book } from "./app.tsx"
import { signal } from "@preact/signals"

export const isDocumentDialogOpen = signal(false)

type FileListProps = {
	openNextInQue: () => Promise<any>
}

export function FileList({ openNextInQue }: FileListProps) {
	const [books, setBooks, index, setIndex] = useContext(DB)

	async function openNext(callback: () => Promise<any>) {
		// setIsOpening(true)
		await callback() // props.openNext_in_que()
		// setIsOpening(false)
	}

	function removeBook(index: number) {
		setBooks((oldBooks) => {
			const newBooks = [...oldBooks]
			newBooks.splice(index, 1)
			return newBooks
		})
	}

	return (
		<div>
			{index !== null ? (
				<div className="loader" />
			) : (
				<div>
					<button onClick={() => openNext(openNextInQue)}>
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
										id="file"
										max="100"
										value={file.priority}
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
			)}
		</div>
	)
}
