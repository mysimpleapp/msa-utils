export function importOnCall(src, fun) {
	return async function (...args) {
		const mod = await import(src)
		return mod[fun](...args)
	}
}

const addErrorPopup = importOnCall("/utils/msa-utils-popup.js", "addErrorPopup")
const setMsaAppEditor = importOnCall("/msa-app-edition.js", "setMsaAppEditor")

// method for cached query in dom
export function Q(query) {
	var qels = this._Qels
	if (qels === undefined)
		qels = this._Qels = {}
	var el = qels[query]
	if (el === undefined)
		el = qels[query] = this.querySelector(query)
	return el
}

// method for cached query in shadow dom
export function S(query) {
	var sels = this._Sels
	if (sels === undefined)
		sels = this._Sels = {}
	var el = sels[query]
	if (el === undefined)
		el = sels[query] = this.shadowRoot.querySelector(query)
	return el
}


// ajax //////////////////////////////////////////////

export function ajax(method, url, arg1, arg2) {
	if (typeof arg1 === "function") var onsuccess = arg1
	else var args = arg1, onsuccess = arg2
	// build & send XMLHttpRequest
	const xhr = new XMLHttpRequest()
	// args
	const query = args && args.query
	let body = args && args.body
	const headers = args && (args.headers || args.header)
	const loadingDom = args && args.loadingDom
	xhr.parseRes = args && args.parseRes
	xhr.popupError = args && args.popupError
	if (args)
		for (let evt in args)
			if (evt.substring(0, 2) === "on")
				xhr[evt] = args[evt]
	// onsuccess (deprecated)
	if (onsuccess) {
		console.warn("DEPRECATED way of using Msa.ajax !\n" + (new Error().stack))
		xhr.onsuccess = onsuccess
	}
	// url (with query)
	if (query) url = formatUrl(url, query)
	xhr.open(method, url, true)
	// body
	if (body) {
		// body format
		let contentType = args.contentType
		if (contentType === undefined) {
			contentType = (typeof body === "object") ? 'application/json' : 'text/plain'
		}
		if (contentType) xhr.setRequestHeader('Content-Type', contentType)
		// format 
		if (contentType === 'application/json')
			body = JSON.stringify(body)
	}
	// header
	if (headers)
		for (var h in headers)
			xhr.setRequestHeader(h, headers[h])
	// send request
	xhr.send(body)
	// loader
	if (loadingDom) {
		initLoader()
		loadingDom.classList.add("msa-loading")
	}
	// output promise
	const prm = new Promise((ok, ko) => {
		xhr.onload = evt => {
			if (loadingDom) loadingDom.classList.remove("msa-loading")
			const xhr = evt.target, status = xhr.status
			if (status >= 200 && status < 300)
				_ajax_parseRes(evt, ok)
			if (status >= 400) {
				let _ko = ko
				let popupError = xhr.popupError
				if (popupError) {
					if (popupError === true) popupError = document.body
					_ko = (res, evt) => {
						addErrorPopup(popupError, res)
						ko(res, evt)
					}
				}
				_ajax_parseRes(evt, _ko)
			}
		}
	})
	if (xhr.onsuccess) prm.then(xhr.onsuccess)
	return prm
}

const _ajax_parseRes = function (evt, next) {
	if (!next) return
	var xhr = evt.target
	var parseRes = (xhr.parseRes !== false)
	var type = xhr.getResponseHeader('content-type').split(';')[0]
	if (parseRes && type === 'application/json') {
		var res = xhr.responseText
		var json = res ? JSON.parse(res) : null
		next(json, evt)
	} else if (parseRes && type === 'application/xml') {
		next(xhr.responseXML, evt)
	} else {
		next(xhr.responseText, evt)
	}
}

// URL serialization /////////////////////////////////////////////

export function formatUrl(arg1, arg2) {
	// get base from location, if not provided
	if (arg2 !== undefined) var base = arg1, args = arg2
	else var args = arg1, loc = window.location, base = loc.origin + loc.pathname
	// add args, if provided
	var res = base
	if (args) {
		var urlArgs = formatUrlArgs(args)
		if (urlArgs) res += '?' + formatUrlArgs(args)
	}
	return res
}
export function formatUrlArgs(args) {
	var res = []
	for (var a in args) {
		var val = args[a]
		if (val !== null && val !== "")
			res.push(encodeURIComponent(a) + "=" + encodeURIComponent(args[a]))
	}
	return res.join("&")
}

export function parseUrl(str) {
	// get string from location, if not provided
	if (str === undefined) str = window.location.href
	var res = { base: null, args: null }
	var pair = str.split('?')
	res.base = pair[0]
	var argsStr = pair[1]
	if (argsStr !== undefined)
		res.args = parseUrlArgs(argsStr)
	return res
}
export function parseUrlArgs(str) {
	// get string from location, if not provided
	if (str === undefined) str = window.location.search.substring(1)
	// parse args
	var res = {}
	str.split("&").forEach(function (keyVal) {
		var pair = keyVal.split('=')
		if (pair.length == 2)
			res[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
	})
	return res
}

// expandHtmlExpr /////////////////////////////////////////////

// input: str | obj | HTMLElement, bool
// output: { head|body: [ str | obj | HTMLElement ] }
// the special keys (wel, mod, imp...) are interpreted
export function expandHtmlExpr(expr) {
	const head = [], body = [], isHead = true
	_expandHtmlExpr_core(expr, head, body, isHead)
	return { head, body }
}
function _expandHtmlExpr_core(expr, head, body, isHead) {
	if (!expr) return
	if (expr instanceof HTMLElement)
		// case HTML Element
		return _expandHtml_push(expr, head, body, isHead)
	var exprType = typeof expr
	if (exprType === "string") {
		// case string
		_expandHtml_push(expr.trim(), head, body, isHead)
	} else if (exprType === "object") {
		// case array
		const len = expr.length
		if (len !== undefined) {
			for (let i = 0; i < len; ++i)
				_expandHtmlExpr_core(expr[i], head, body, isHead)
			// case object
		} else {
			var tag = expr.tag
			var cnt = expr.content || expr.cnt
			var attrs = expr.attributes || expr.attrs
			var style = expr.style
			var imp = expr.import
			var mod = expr.module || expr.mod
			var js = expr.script || expr.js
			var css = expr.stylesheet || expr.css
			var wel = expr.webelement || expr.wel
			// web element
			if (wel) {
				const ext = wel.split(".").pop()
				if (ext === "html") {
					_expandHtmlExpr_core({ import: wel }, head, body, isHead)
					tag = tag || /([a-zA-Z0-9-_]*)\.html$/.exec(wel)[1]
				} else if (ext === "js") {
					_expandHtmlExpr_core({ mod: wel }, head, body, isHead)
					tag = tag || /([a-zA-Z0-9-_]*)\.js$/.exec(wel)[1]
				}
				isHead = false
			}
			// html import
			if (imp && !tag) {
				tag = 'link'
				attrs = attrs || {}
				attrs.rel = 'import'
				attrs.href = imp
				isHead = true
			}
			// js module
			if (mod && !tag) {
				tag = 'script'
				attrs = attrs || {}
				attrs.src = mod
				attrs.type = 'module'
				isHead = true
			}
			// script
			if (js && !tag) {
				tag = 'script'
				attrs = attrs || {}
				attrs.src = js
				isHead = true
			}
			// stylesheet
			if (css && !tag) {
				tag = 'link'
				attrs = attrs || {}
				attrs.rel = 'stylesheet'
				attrs.type = 'text/css'
				attrs.href = css
				isHead = true
			}
			// style
			if (style) {
				if (!attrs) attrs = {}
				attrs.style = style
			}
			// push
			if (tag) {
				_expandHtml_push({ tag, attrs, cnt }, head, body, isHead)
			}
			// body
			_expandHtmlExpr_core(expr.body, head, body, false)
			// head
			_expandHtmlExpr_core(expr.head, head, body, true)
		}
	}
}

function _expandHtml_push(html, head, body, isHead) {
	if (isHead) head.push(html)
	else body.push(html)
}

// input: str | obj | HTMLElement, bool
// output: { head|body: [ HTMLElement ] }
export function convertHtmlExpr(htmlExpr) {
	const { head, body } = expandHtmlExpr(htmlExpr)
	return {
		head: _convertHtmlExpr_core(head, true),
		body: _convertHtmlExpr_core(body, false)
	}
}

function _convertHtmlExpr_core(arr, isHead) {
	const res = []
	for (const a of arr) {
		const t = typeof a
		if (t === "string") {
			const tmpl = document.createElement("template")
			tmpl.innerHTML = a
			for (const el of tmpl.content.childNodes)
				if (!isHead || el.nodeType === Node.ELEMENT_NODE)
					res.push(el)
		} else if (a instanceof HTMLElement) {
			res.push(a)
		} else if (t === "object") {
			const el = document.createElement(a.tag)
			const attrs = a.attrs
			if (attrs) for (const k in attrs)
				el.setAttribute(k, attrs[k])
			const cnt = a.cnt
			if (cnt) el.innerHTML = cnt
			res.push(el)
		}
	}
	return res
}
// importHtml ///////////////////////////////////

// cache of promises on any content imported into document head
const ImportCache = {}

// input: str | obj | HTMLElement (, el), kwargs
export async function importHtml(html, arg1, arg2) {
	let el, kwargs
	if (arg1 instanceof HTMLElement) {
		el = arg1; kwargs = arg2
	} else {
		kwargs = arg1
	}
	const isHead = el ? false : true
	html = isHead ? { head: html } : { body: html }
	let convertedHtml
	if (kwargs && kwargs.boxParent) {
		convertedHtml = await convertBoxHtmlExpr(html)
	} else {
		convertedHtml = convertHtmlExpr(html)
	}
	const { head, body } = convertedHtml
	const loads = []
	if (head) {
		// for each input head element 
		for (let h of head) {
			// check if it is already in cache
			const hHtml = h.outerHTML
			let prm = ImportCache[hHtml]
			if (!prm) {
				// create promise to load input head
				const h2 = cloneEl(h) // hack to force scripts to load
				prm = ImportCache[hHtml] = new Promise((ok, ko) => {
					h2.addEventListener("load", ok)
					h2.addEventListener("error", ko)
					document.head.appendChild(h2)
				})
			}
			loads.push(prm)
		}
	}
	return new Promise((ok, ko) => {
		Promise.all(loads)
			.then(() => {
				const newEls = []
				if (body) for (let b of body) {
					newEls.push(b)
					if (el) el.appendChild(b)
					if (kwargs && kwargs.boxParent && b.initAsMsaBox)
						b.initAsMsaBox(kwargs.boxParent)
				}
				ok(newEls)
			})
			.catch(ko)
	})
}

// boxes ////////////////////////////////////

let MsaBoxInfosPrm = null

export async function registerMsaBox(tag, kwargs) {
	const boxInfos = await fetchMsaBoxInfos()
	if(!boxInfos[tag]) boxInfos[tag] = {}
	Object.assign(boxInfos[tag], kwargs)
}

export function fetchMsaBoxInfos() {
	if (!MsaBoxInfosPrm)
		MsaBoxInfosPrm = ajax("GET", "/utils/boxes")
	return MsaBoxInfosPrm
}

export async function getMsaBoxInfo(el) {
	const boxInfos = await fetchMsaBoxInfos()
	const tag = _getBoxTag(el)
	return boxInfos[tag]
}

async function _importMsaBoxHead(boxInfo) {
	if (boxInfo.head) await import(boxInfo.head)
}

export async function createMsaBox(tag, parent) {
	const boxInfo = await getMsaBoxInfo(tag)
	await _importMsaBoxHead(boxInfo)
	const createBox = boxInfo.createBox
	return createBox ? await createBox(parent) : document.createElement(tag)
}

export async function exportMsaBox(el) {
	// array support
	const els = el.length !== undefined ? el : [el]
	// copy in template
	const headTmpl = document.createElement("template")
	const bodyTmpl = document.createElement("template")
	for (let i = 0, len = els.length; i < len; ++i)
		bodyTmpl.content.appendChild(els[i].cloneNode(true))
	// deep loop in msa boxes
	await forEachChildMsaBox(bodyTmpl.content, async (box, boxInfo) => {
		// Add heads
		const head = boxInfo.head
		if(head) {
			const scriptEl = document.createElement("script")
			scriptEl.type = "module"
			scriptEl.src = head
			headTmpl.content.appendChild(scriptEl)
		}
		// call export functions
		const exportBox = boxInfo.exportBox
		if (exportBox) {
			const ebox = await exportBox(box)
			box.parentNode.replaceChild(ebox, box)
		}
	})
	return {
		head: headTmpl,
		body: bodyTmpl
	}
}

export async function editMsaBox(boxEl, val) {
	const boxInfo = await getMsaBoxInfo(boxEl)
	const editBox = boxInfo.editBox
	let editorEl = null
	if (editBox) {
		editorEl = await editBox(boxEl, val)
	}
	await setMsaAppEditor(val ? editorEl : null)
}

function _getBoxTag(box) {
	if (typeof box === "string") return box
	else if (box instanceof HTMLElement) return box.tagName.toLowerCase()
}

export async function forEachChildMsaBox(el, fun) {
	if (!el) return
	const els = (el.length !== undefined) ? el : [el]
	await Promise.all(_map(els, async _el => {
		const boxInfo = await getMsaBoxInfo(_el)
		if (boxInfo) await fun(_el, boxInfo)
		else await forEachChildMsaBox(_el.children, fun)
	}))
}

export function exposeMsaBoxCtx(el, ctx) {
	el.exposedMsaBoxCtx = ctx
}

export async function getMsaBoxCtx(el) {
	while(true) {
		const parentEl = el.parentNode
		if(!parentEl) return
		if(parentEl.exposedMsaBoxCtx)
			return parentEl.exposedMsaBoxCtx
		el = parentEl
	}
}

// map that works also on NodeList
function _map(arr, maper) {
	const res = []
	for (let i = 0, len = arr.length; i < len; ++i)
		res.push(maper(arr[i]))
	return res
}


// box text

importHtml(`<style>
	msa-utils-text-box {
		padding: .5em;
		min-height: 1em;
		width: 100%;
	}
</style>`)

class MsaUtilsTextBoxHTMLElement extends HTMLElement {
	connectedCallback() {
		this.contentEl = this.querySelector(".content")
		if(!this.contentEl) {
			this.contentEl = document.createElement("div")
			this.contentEl.classList.add("content")
			this.appendChild(this.contentEl)
		}
    }
}
customElements.define("msa-utils-text-box", MsaUtilsTextBoxHTMLElement)

registerMsaBox("msa-utils-text-box", {
	editBox: async function(boxEl, editable) {
		if(editable) {
			if(!boxEl.msaBoxEditorEl) {
				await import("/utils/msa-utils-text-editor.js")
				boxEl.msaBoxEditorEl = document.createElement("msa-utils-text-editor")
				boxEl.msaBoxEditorEl.initTarget(boxEl)
			}
			return boxEl.msaBoxEditorEl
		} else {
			if(boxEl.msaBoxEditorEl) {
				boxEl.msaBoxEditorEl.remove()
				delete boxEl.msaBoxEditorEl
			}
		}
	}
})

// loader ///////////////////////////////////

// default loader (can be modified by setLoaderHtml)
let loaderHtml = `<style>

	msa-loader {
		height: 1.5em;
		width: 1.5em;
		background-position: center center;
		background-repeat: no-repeat;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' style='fill:none; stroke:black; stroke-width:15'><path d='M15,50 a1,1 0 0,0 70,0' /></svg>");
		animation: msa-loader-spin 1s linear infinite;
	}

	@keyframes msa-loader-spin {
		from{transform:rotate(0deg)}
		to{transform:rotate(360deg)}	
	}
</style>`

// default loader style
importHtml(`<style>
	msa-loader {
		display: none;
		height: 1.5em;
		width: 1.5em;
		margin: auto;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
	}
	msa-loader.msa-loading, .msa-loading msa-loader {
		display: inline-block;
	}

	.msa-loading.msa-loading-invisible, .msa-loading .msa-loading-invisible {
		visibility: hidden;
	}
	.msa-loading.msa-loading-hidden, .msa-loading .msa-loading-hidden {
		display: none;
	}

</style>`)

let loaderInitialised = false

export function setLoaderHtml(html) {
	loaderHtml = html
}

function initLoader() {
	if (loaderInitialised) return
	loaderInitialised = true
	importHtml(loaderHtml)
}

// icon //////////////////////////////////

class MsaUtilsIconHTMLElement extends HTMLElement {
	connectedCallback() {
		const shdw = this.attachShadow({ mode: 'open' })
		const iconEl = document.createElement("div")
		Object.assign(iconEl.style, {
			width: this.getAttribute("width") || this.style.width || "50px",
			height: this.getAttribute("height") || this.style.height || "50px",
			backgroundColor: this.getAttribute("color") || "black",
			maskImage: `url(${this.getAttribute("src")})` || "",
			maskRepeat: "no-repeat",
			maskPosition: "center",
			maskSize: "100%"
		})
		shdw.appendChild(iconEl)
    }
}
customElements.define("msa-utils-icon", MsaUtilsIconHTMLElement)


// utils ///////////////////////////////////

function cloneEl(el) {
	const el2 = document.createElement(el.tagName)
	for (let att of el.attributes)
		el2.setAttribute(att.name, att.value)
	el2.innerHTML = el.innerHTML
	return el2
}

function join(cont, delim) {
	let res = "", first = true
	for (var c of cont) {
		if (first) first = false
		else res += delim
		res += c
	}
	return res
}

