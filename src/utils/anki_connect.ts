export function invoke(
	action: string,
	version: number,
	params = {}
): Promise<any> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		xhr.addEventListener("error", () =>
			reject(new Error("failed to issue request"))
		)
		xhr.addEventListener("load", () => {
			try {
				const response = JSON.parse(xhr.responseText)
				if (Object.getOwnPropertyNames(response).length !== 2) {
					throw new Error(
						"response has an unexpected number of fields"
					)
				}
				if (typeof response.error === undefined) {
					throw new Error("response is missing required error field")
				}
				if (typeof response.result === undefined) {
					throw new Error("response is missing required result field")
				}
				if (response.error) {
					throw new Error(response.error)
				}
				resolve(response.result)
			} catch (e) {
				reject(e)
			}
		})

		xhr.open("POST", "http://127.0.0.1:8765")
		xhr.send(JSON.stringify({ action, version, params }))
	})
}
