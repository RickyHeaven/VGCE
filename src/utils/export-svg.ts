const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'
const XHTML_NS = 'http://www.w3.org/1999/xhtml'

const HTML_STYLE_KEYS = [
	'display',
	'position',
	'top',
	'right',
	'bottom',
	'left',
	'float',
	'clear',
	'visibility',
	'opacity',
	'z-index',
	'box-sizing',
	'width',
	'height',
	'min-width',
	'min-height',
	'max-width',
	'max-height',
	'margin-top',
	'margin-right',
	'margin-bottom',
	'margin-left',
	'padding-top',
	'padding-right',
	'padding-bottom',
	'padding-left',
	'overflow',
	'overflow-x',
	'overflow-y',
	'border-top-width',
	'border-right-width',
	'border-bottom-width',
	'border-left-width',
	'border-top-style',
	'border-right-style',
	'border-bottom-style',
	'border-left-style',
	'border-top-color',
	'border-right-color',
	'border-bottom-color',
	'border-left-color',
	'border-top-left-radius',
	'border-top-right-radius',
	'border-bottom-left-radius',
	'border-bottom-right-radius',
	'background-color',
	'background-image',
	'background-position',
	'background-size',
	'background-repeat',
	'box-shadow',
	'color',
	'font-family',
	'font-size',
	'font-weight',
	'font-style',
	'line-height',
	'letter-spacing',
	'text-align',
	'text-decoration-line',
	'text-decoration-color',
	'text-transform',
	'white-space',
	'word-break',
	'vertical-align',
	'list-style-type',
	'border-collapse',
	'border-spacing',
	'table-layout',
	'flex-direction',
	'flex-wrap',
	'flex-grow',
	'flex-shrink',
	'flex-basis',
	'align-items',
	'align-content',
	'align-self',
	'justify-content',
	'order',
	'gap',
	'row-gap',
	'column-gap',
	'grid-template-columns',
	'grid-template-rows',
	'grid-column',
	'grid-row'
]

const SKIP_STYLE_KEYS = new Set([
	'animation',
	'animation-name',
	'animation-duration',
	'animation-delay',
	'animation-timing-function',
	'animation-iteration-count',
	'animation-direction',
	'animation-fill-mode',
	'animation-play-state',
	'transition',
	'transition-property',
	'transition-duration',
	'transition-delay',
	'transition-timing-function',
	'transform',
	'transform-origin',
	'transform-box',
	'cursor',
	'pointer-events',
	'will-change',
	'user-select'
])

interface IExportSvgOptions {
	filename?: string
	background?: string
	padding?: number
}

const inlineComputedStyle = (source: Element, clone: Element) => {
	if (source.namespaceURI !== SVG_NS) {
		const computed = window.getComputedStyle(source as HTMLElement)
		const style = (clone as HTMLElement).style
		HTML_STYLE_KEYS.forEach((key) => {
			if (SKIP_STYLE_KEYS.has(key)) {
				return
			}
			const value = computed.getPropertyValue(key)
			if (value) {
				style.setProperty(key, value)
			}
		})
	}
	const sourceChildren = source.children
	const cloneChildren = clone.children
	const length = Math.min(sourceChildren.length, cloneChildren.length)
	for (let i = 0; i < length; i++) {
		inlineComputedStyle(sourceChildren[i], cloneChildren[i])
	}
}

const inlineForeignObjectStyles = (sourceSvg: Element, cloneSvg: Element) => {
	const sourceObjects = Array.from(sourceSvg.querySelectorAll('foreignObject'))
	const cloneObjects = Array.from(cloneSvg.querySelectorAll('foreignObject'))
	const length = Math.min(sourceObjects.length, cloneObjects.length)
	for (let i = 0; i < length; i++) {
		const sourceRoot = sourceObjects[i].firstElementChild
		const cloneRoot = cloneObjects[i].firstElementChild
		if (sourceRoot && cloneRoot) {
			inlineComputedStyle(sourceRoot, cloneRoot)
		}
	}
}

const replaceCanvas = (sourceSvg: Element, cloneSvg: Element) => {
	const sourceCanvasList = Array.from(sourceSvg.querySelectorAll('foreignObject canvas')) as HTMLCanvasElement[]
	const cloneCanvasList = Array.from(cloneSvg.querySelectorAll('foreignObject canvas')) as HTMLCanvasElement[]
	const length = Math.min(sourceCanvasList.length, cloneCanvasList.length)
	for (let i = 0; i < length; i++) {
		const sourceCanvas = sourceCanvasList[i]
		const cloneCanvas = cloneCanvasList[i]
		try {
			const dataUrl = sourceCanvas.toDataURL('image/png')
			const computed = window.getComputedStyle(sourceCanvas)
			const img = document.createElementNS(XHTML_NS, 'img')
			img.setAttribute('src', dataUrl)
			img.setAttribute('style', `display:block;width:${computed.width};height:${computed.height};`)
			cloneCanvas.replaceWith(img)
		} catch (e) {
			console.warn('export svg: canvas 转换失败', e)
		}
	}
}

const collectUseHref = (root: Element, ids: Set<string>) => {
	root.querySelectorAll('use').forEach((use) => {
		const href = use.getAttribute('xlink:href') || use.getAttribute('href')
		if (href && href.startsWith('#')) {
			ids.add(href.slice(1))
		}
	})
}

const copySymbols = (cloneSvg: Element, defs: Element) => {
	const usedIds = new Set<string>()
	collectUseHref(cloneSvg, usedIds)

	const existingIds = new Set<string>()
	cloneSvg.querySelectorAll('[id]').forEach((el) => {
		const id = el.getAttribute('id')
		if (id) {
			existingIds.add(id)
		}
	})

	const pending = Array.from(usedIds)
	while (pending.length > 0) {
		const id = pending.shift()
		if (!id || existingIds.has(id)) {
			continue
		}
		const sourceSymbol = document.getElementById(id)
		if (!sourceSymbol) {
			continue
		}
		defs.appendChild(sourceSymbol.cloneNode(true))
		existingIds.add(id)
		const childIds = new Set<string>()
		collectUseHref(sourceSymbol, childIds)
		childIds.forEach((childId) => {
			if (!existingIds.has(childId) && pending.indexOf(childId) < 0) {
				pending.push(childId)
			}
		})
	}
}

const removeEditorOnly = (cloneSvg: Element) => {
	cloneSvg.querySelectorAll('[data-editor-only]').forEach((el) => el.remove())
}

const computeContentBound = (content: Element | null) => {
	if (!content) {
		return null
	}
	const editorOnlyList = Array.from(content.querySelectorAll('[data-editor-only]')) as HTMLElement[]
	const oldDisplayList = editorOnlyList.map((el) => el.style.display)
	let box: SVGRect | null = null
	try {
		editorOnlyList.forEach((el) => (el.style.display = 'none'))
		box = (content as SVGGraphicsElement).getBBox()
	} catch (e) {
		console.warn('export svg: 计算画布内容边界失败', e)
	} finally {
		editorOnlyList.forEach((el, index) => (el.style.display = oldDisplayList[index]))
	}
	return box
}

const collectAnimationClassNames = (svg: Element) => {
	const names = new Set<string>()
	svg.querySelectorAll('[class]').forEach((el) => {
		Array.from(el.classList).forEach((name) => {
			if (name.indexOf('animate__') === 0) {
				names.add(name)
			}
		})
	})
	return names
}

const matchAnimationClass = (selectorText: string, classNames: Set<string>) => {
	let matched = false
	classNames.forEach((name) => {
		if (selectorText.indexOf(`.${name}`) > -1) {
			matched = true
		}
	})
	return matched
}

const walkStyleRules = (rules: CSSRuleList, onRule: (rule: CSSStyleRule) => void) => {
	Array.from(rules).forEach((rule) => {
		if (rule instanceof CSSStyleRule) {
			onRule(rule)
		} else if ((rule as CSSMediaRule).cssRules) {
			walkStyleRules((rule as CSSMediaRule).cssRules, onRule)
		}
	})
}

const collectAnimationCss = (svg: Element) => {
	const classNames = collectAnimationClassNames(svg)
	if (classNames.size === 0) {
		return ''
	}
	const styleRules: string[] = []
	const keyframesNames = new Set<string>()
	const keyframesRules: string[] = []

	Array.from(document.styleSheets).forEach((sheet) => {
		let rules: CSSRuleList | null = null
		try {
			rules = sheet.cssRules
		} catch (e) {
			rules = null
		}
		if (!rules) {
			return
		}
		walkStyleRules(rules, (rule) => {
			if (!matchAnimationClass(rule.selectorText, classNames)) {
				return
			}
			styleRules.push(rule.cssText)
			const animationName = rule.style.getPropertyValue('animation-name')
			if (animationName) {
				animationName.split(',').forEach((name) => keyframesNames.add(name.trim()))
			}
		})
		Array.from(rules).forEach((rule) => {
			if (rule instanceof CSSKeyframesRule && keyframesNames.has(rule.name)) {
				keyframesRules.push(rule.cssText)
			}
		})
	})

	if (styleRules.length === 0) {
		return ''
	}

	keyframesNames.forEach((name) => {
		if (keyframesRules.some((css) => css.indexOf(`@keyframes ${name}`) > -1)) {
			return
		}
		Array.from(document.styleSheets).forEach((sheet) => {
			let rules: CSSRuleList | null = null
			try {
				rules = sheet.cssRules
			} catch (e) {
				rules = null
			}
			if (!rules) {
				return
			}
			Array.from(rules).forEach((rule) => {
				if (rule instanceof CSSKeyframesRule && rule.name === name) {
					keyframesRules.push(rule.cssText)
				}
			})
		})
	})

	return [...styleRules, ...keyframesRules].join('\n')
}

export const getCanvasSvgString = (svg: SVGSVGElement, options: IExportSvgOptions = {}) => {
	const padding = options.padding ?? 20
	const content = svg.querySelector('[data-canvas-content]')
	let box: SVGRect | null = computeContentBound(content)

	if (!box || !box.width || !box.height) {
		const rect = svg.getBoundingClientRect()
		box = {
			x: 0,
			y: 0,
			width: rect.width || 800,
			height: rect.height || 600
		} as SVGRect
	}

	const viewBox = {
		x: box.x - padding,
		y: box.y - padding,
		width: box.width + padding * 2,
		height: box.height + padding * 2
	}

	const clone = svg.cloneNode(true) as SVGSVGElement
	removeEditorOnly(clone)

	const cloneContent = clone.querySelector('[data-canvas-content]')
	if (cloneContent) {
		cloneContent.removeAttribute('transform')
		cloneContent.removeAttribute('data-canvas-content')
	}

	replaceCanvas(svg, clone)
	inlineForeignObjectStyles(svg, clone)

	clone.setAttribute('xmlns', SVG_NS)
	clone.setAttribute('xmlns:xlink', XLINK_NS)
	clone.setAttribute('width', `${Math.ceil(viewBox.width)}`)
	clone.setAttribute('height', `${Math.ceil(viewBox.height)}`)
	clone.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`)

	const defs = (clone.querySelector('defs') as Element) || document.createElementNS(SVG_NS, 'defs')
	if (!defs.parentNode) {
		clone.insertBefore(defs, clone.firstChild)
	}

	copySymbols(clone, defs)

	const style = document.createElementNS(SVG_NS, 'style')
	const animationCss = collectAnimationCss(svg)
	style.textContent = `.common-ani{transform-box:fill-box;}${animationCss ? `\n${animationCss}` : ''}`
	defs.appendChild(style)

	if (options.background) {
		const background = document.createElementNS(SVG_NS, 'rect')
		background.setAttribute('x', `${viewBox.x}`)
		background.setAttribute('y', `${viewBox.y}`)
		background.setAttribute('width', `${viewBox.width}`)
		background.setAttribute('height', `${viewBox.height}`)
		background.setAttribute('fill', options.background)
		clone.insertBefore(background, clone.firstChild)
	}

	return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`
}

export const downloadSvgFile = (content: string, filename?: string) => {
	const name = (filename || `svg-canvas-${Date.now()}`).replace(/\.svg$/i, '')
	const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = `${name}.svg`
	link.style.display = 'none'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	setTimeout(() => URL.revokeObjectURL(url), 0)
}

export const exportCanvasSvg = (svg: SVGSVGElement, options: IExportSvgOptions = {}) => {
	const content = getCanvasSvgString(svg, options)
	downloadSvgFile(content, options.filename)
}