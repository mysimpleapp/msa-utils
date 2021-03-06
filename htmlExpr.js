const exp = module.exports = {}

// require
const { join, resolve, basename } = require('path')
const htmlparser2 = require("htmlparser2")

// convert HTML expression to HTML object
exp.formatHtml = function (htmlExpr, res) {
	if (!res) res = {}
	// fill head & body objects
	var head = new Set(), body = []
	_formatHtml_core(htmlExpr, head, body, false)
	// format head & body to sring
	var bodyStr = body.join('')
	var headStr = ""
	for (var h of head)
		headStr += h
	// return HTML string
	res.head = headStr
	res.body = bodyStr
	return res
}
function _formatHtml_core(htmlExpr, head, body, isHead) {
	var type = typeof htmlExpr
	// case string
	if (type === "string") {
		_formatHtml_push(htmlExpr, head, body, isHead)
	} else if (type === "object") {
		// case array
		var len = htmlExpr.length
		if (len !== undefined) {
			for (var i = 0; i < len; ++i)
				_formatHtml_core(htmlExpr[i], head, body, isHead)
			// case object
		} else {
			var tag = htmlExpr.tag
			var cnt = htmlExpr.content || htmlExpr.cnt
			var attrs = htmlExpr.attributes || htmlExpr.attrs
			var style = htmlExpr.style
			var mod = htmlExpr.module || htmlExpr.mod
			var imp = htmlExpr.import
			var js = htmlExpr.script || htmlExpr.js
			var css = htmlExpr.stylesheet || htmlExpr.css
			var wel = htmlExpr.webelement || htmlExpr.wel
			// web element
			if (wel) {
				const ext = wel.split(".").pop()
				if (ext === "html") {
					_formatHtml_core({ import: wel }, head, body, isHead)
					tag = tag || basename(wel, '.html')
				} else if (ext === "js") {
					_formatHtml_core({ mod: wel }, head, body, isHead)
					tag = tag || basename(wel, '.js')
				}
				isHead = false
			}
			// js module
			if (mod && !tag) {
				tag = 'script'
				attrs = attrs || {}
				attrs.src = mod
				attrs.type = 'module'
				isHead = true
			}
			// html import
			if (imp && !tag) {
				tag = 'link'
				attrs = attrs || {}
				attrs.rel = 'import'
				attrs.href = imp
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
			// tag (with attrs, style & content)
			tag = htmlExpr.tag || tag
			if (tag) {
				let part1 = '<' + tag
				// attrs
				if (style) {
					if (!attrs) attrs = {}
					attrs.style = style
				}
				if (attrs) {
					for (var a in attrs) {
						var val = attrs[a]
						if (val !== undefined) {
							if (style) { a = 'style'; val = style }
							if (a == 'style') val = _formatHtml_style(val)
							part1 += ' ' + a + '="' + val + '"'
						}
					}
				}
				part1 += '>'
				let part2 = '</' + tag + '>'
				if (isHead) {
					let str = part1
					if (cnt) str += cnt
					str += part2
					_formatHtml_push(str, head, body, isHead)
				} else {
					_formatHtml_push(part1, head, body, isHead)
					if (cnt) _formatHtml_core(cnt, head, body, isHead)
					_formatHtml_push(part2, head, body, isHead)
				}
			}
			// body
			_formatHtml_core(htmlExpr.body, head, body, false)
			// head
			_formatHtml_core(htmlExpr.head, head, body, true)
		}
	}
}
function _formatHtml_style(style) {
	var type = typeof style
	if (type === "string") return style
	else if (type === "object") {
		var str = ""
		for (var a in style) str += a + ':' + style[a] + '; '
		return str
	}
}
function _formatHtml_push(html, head, body, isHead) {
	if (isHead) head.add(html)
	else body.push(html)
}

// Check that an object match an user expr
function checkHtmlExpr(match, htmlExpr) {
	var tag = match.tag
	if (tag && tag !== htmlExpr.tag) return false
	var attrs = match.attrs
	if (attrs) {
		var htmlAttrs = htmlExpr.attrs
		if (!htmlAttrs) return false
		for (var p in attrs) {
			if (attrs[p] !== htmlAttrs[p]) return false
		}
	}
	return true
}
exp.checkHtmlExpr = checkHtmlExpr

// html parser ///////////////////////////////////////////////////////////////////

exp.parseHtml = function (html) {
	var domStack = [{ tag: "root", content: [] }]
	var parser = new htmlparser2.Parser({
		onopentag: function (tag, attrs) {
			var newDom = {
				tag: tag,
				attrs: attrs,
				content: []
			}
			domStack[domStack.length - 1].content.push(newDom)
			domStack.push(newDom)
		},
		ontext: function (text) {
			domStack[domStack.length - 1].content.push(text)
		},
		onclosetag: function (tag) {
			domStack.pop()
		}
	}, { decodeEntities: true })
	parser.write(html)
	parser.end()
	return { body: domStack[0].content }
}
