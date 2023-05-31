export function fileWrite(d: any, name = new Date(Date.now()).toLocaleString()) {
	const t = JSON.stringify(d)
	const blob = new Blob([t])
	let l = document.createElement('a')
	l.download = name + '.json'
	l.style.display = 'none'
	l.href = URL.createObjectURL(blob)

	document.body.appendChild(l)
	l.click()
	document.body.removeChild(l)
}

export function fileRead(d: File) {
	return new Promise((r, j) => {
		let reader = new FileReader()
		reader.readAsText(d, 'UTF-8')
		reader.onload = function (e) {
			if (e && e.target) {
				r(e.target.result)
			} else {
				j('文件读取错误')
			}
		}
	})
}
