if(!window.MsaUtils) MsaUtils = window.MsaUtils = {}

// events

export function trigger(el, evt) {
	el.dispatchEvent(new Event(evt))
}
MsaUtils.trigger = trigger

// size

export function isSize(size) {
	return size.search(/^[0-9.]+[px%]+$/)!=-1
}
MsaUtils.isSIze = isSize
export function getSizeVal(size) {
	return size.match(/^[0-9.]*/)[0]
}
MsaUtils.getSizeVal = getSizeVal
export function getSizeUnit(size) {
	return size.match(/[a-z%]*$/)[0]
}
MsaUtils.getSizeUnit = getSizeUnit

// backup & restore

export function backup(target, args) {
	// default args
	var key = defArg(args, "key", "MsaUtilsStyleBackup")
	var innerHTML = defArg(args, "innerHTML", false)
	var outerHTML = defArg(args, "outerHTML", false)
	var style = defArg(args, "style", false)
	var attrs = defArg(args, "attrs", false)
	if(innerHTML===false && outerHTML===false && style===false && attrs===false)
		outerHTML = true
	var overwrite = defArg(args, "overwrite", false)
	// check that backup does not already exist
	var backup = target[key]
	if(backup && !overwrite) return
	// create backup
	backup = target[key] = {}
	// HTML
	if(innerHTML) backup.innerHTML = target.innerHTML
	if(outerHTML) backup.outerHTML = target.outerHTML
	// style
	if(style) {
		var backupStyle = backup.style = {}
		backup.styleArg = style
		var targetStyle = target.style
		if(style===true) 
			Object.assign(backupStyle, targetStyle)
		else {
			for(var i=0, len=style.length; i<len; ++i) {
				var styleKey = style[i]
				backupStyle[styleKey] = targetStyle[styleKey]
			}
		}
	}
	// attrs
	if(attrs) {
		var backupAttrs = backup.attrs = {}
		backup.attrsArg = attrs
		var targetAttrs = target.attributes
		if(attrs===true) {
			for(var i=0, len=targetAttrs.length; i<len; ++i) {
				var attr = targetAttrs[i]
				backupAttrs[attr.nodeName] = attr.nodeValue
			}
		} else {
			for(var i=0, len=attrs.length; i<len; ++i) {
				var attrKey = attrs[i]
				backupAttrs[attrKey] = target.getAttribute(attrKey)
			}
		}
	}
}
MsaUtils.backup = backup

export function restore(target, args) {
	// default args
	var key = defArg(args, "key", "MsaUtilsStyleBackup")
	var clean = defArg(args, "clean", true)
	// check that backup exists
	var backup = target[key]
	if(!backup) return false
	// restore backup
	// HTML
	var backupOuterHTML = backup.outerHTML
	if(backupOuterHTML) target.outerHTML = backupOuterHTML
	var backupInnerHTML = backup.innerHTML
	if(backupInnerHTML) target.innerHTML = backupInnerHTML
	// style
	var backupStyle = backup.style, backupStyleArg = backup.styleArg
	if(backupStyleArg===true) {
		target.style = backupStyle
	} else if(backupStyleArg) {
		var targetStyle = target.style
		for(var i=0, len=backupStyleArg.length; i<len; ++i) {
			var styleKey = backupStyleArg[i]
			targetStyle[styleKey] = backupStyle[styleKey]
		}
	}
	// attrs
	var backupAttrs = backup.attrs, backupAttrsArg = backup.attrsArg
	if(backupAttrsArg===true) {
		var targetAttrs = target.attributes
		for(var i=0, len=targetAttrs.length; i<len; ++i) {
			var attr = targetAttrs[i], attrKey = attr.nodeName
			if(backupAttrs[attrKey]===undefined)
				target.removeAttribute(attrKey)
		}
	}
	if(backupAttrsArg) {
		for(var i=0, len=backupAttrsArg.length; i<len; ++i) {
			var attrKey = backupAttrsArg[i], attrVal = backupAttrs[attr]
			if(attrVal) target.setAttribute(attrKey, attrVal)
			else target.removeAttribute(attrKey)
		}
	}
	// clean backup (if requested)
	if(clean) delete target[key]
	return true
}
MsaUtils.restore = restore

// various

var defArg = function(args, key, defArg) {
	var val = args && args[key]
	return (val!==undefined) ? val : defArg
}

