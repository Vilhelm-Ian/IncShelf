import { useState, useContext } from "preact/hooks"
import { AddDocumentDialog } from "./add_document.tsx"
import { DB, Book } from "./app.tsx"
import { signal } from "@preact/signals"

export const isDocumentDialogOpen = signal(false)

type FileListProps = {
	openNextInQue: () => Promise<any>
	openFile: (path: string, name: string) => Promise<any>
}

export function FileList({ openNextInQue, openFile }: FileListProps) {
	const [isOpening, setIsOpening] = useState(false)
	// TODO use react context provider to sync que
	const books = useContext(DB)[0]

	async function openNext(callback: () => Promise<any>) {
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
									<span
										onClick={() =>
											openNext(() =>
												openFile(
													file.filePath,
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
