import { Book, Note } from "../app.tsx"
import { isBook } from "../db.ts"

const priorityWeight = 0.6
const pagesReadWeight = 0.2
const timesReadWeight = 0.2

export function sortItems(items: [Book | Note]) {
	const minMaxValue = getMinMaxValues(items)
	items.sort((a: Book, b: Book) => {
		const aScore = getScore(a, minMaxValue)
		const bScore = getScore(b, minMaxValue)
		return aScore - bScore
	})
	return items
}

function getScore(item: Book | Note, minMaxValues: number[]) {
	const [
		minPriority,
		maxPriority,
		minReadPages,
		maxReadPages,
		minTimesRead,
		maxTimesRead,
	] = minMaxValues

	let priorityScore =
		normalize(item.priority, minPriority, maxPriority) * priorityWeight
	let readPagesScore: number
	if (isBook(item)) {
		readPagesScore =
			normalize(item.numberOfReadPages, minReadPages, maxReadPages) *
			pagesReadWeight
	}
	let timesReadScore =
		normalize(item.timesRead, minTimesRead, maxTimesRead) * timesReadWeight

	readPagesScore = readPagesScore ? 0 : readPagesScore
	priorityScore = Number.isNaN(priorityScore) ? 0 : priorityScore
	timesReadScore = Number.isNaN(timesReadScore) ? 0 : timesReadScore
	return priorityScore + readPagesScore + timesReadScore
}

function getMinMaxValues(
	items: [Book | Note]
): [number, number, number, number, number, number] {
	let [
		minPriority,
		maxPriority,
		minReadPages,
		maxReadPages,
		minTimesRead,
		maxTimesRead,
	] = [Infinity, 0, Infinity, 0, Infinity, 0]
	for (const item of items) {
		if (item.priority < minPriority) {
			minPriority = item.priority
		} else if (item.priority > maxPriority) {
			maxPriority = item.priority
		}
		if (isBook(item)) {
			if (item.numberOfReadPages < minReadPages) {
				minReadPages = item.numberOfReadPages
			} else if (item.priority > maxReadPages) {
				maxReadPages = item.numberOfReadPages
			}
		}
		if (item.timesRead < minTimesRead) {
			minTimesRead = item.timesRead
		} else if (item.timesRead > maxTimesRead) {
			maxTimesRead = item.timesRead
		}
	}
	return [
		minPriority,
		maxPriority,
		minReadPages,
		maxReadPages,
		minTimesRead,
		maxTimesRead,
	]
}

function normalize(value: number, minValue: number, maxValue: number): number {
	return (value - minValue) / (maxValue - minValue)
}
