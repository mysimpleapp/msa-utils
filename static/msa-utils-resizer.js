import { importHtml } from "/utils/msa-utils.js"
import { backup, restore } from "/utils/msa-utils-common.js"
import { setPositionRelativeTo } from "/utils/msa-utils-position.js"

importHtml(`<style>
	msa-utils-resizer-handle {
		display: box;
		position: absolute;
		outline: 1px solid black;
		width: 10px;
		height: 10px;
		background: #ccc;
		opacity: 0.4;
	}
	msa-utils-resizer-handle.activated {
		background: white;
		opacity: 1;
	}
</style>`)

var _ResizingResizer = null, _ResizingHandle = null

// resizer ///////////////////////////////////////////////

function createResizer(target, methods, eventKey, args) {
	var resizer = {}
	// link to target
	resizer.target = target
	// methods
	Object.assign(resizer, commonMethods)
	Object.assign(resizer, methods)
	// event
	resizer.eventKey = eventKey
	// handles
	resizer.handles = []
	createHandle(resizer, "left", "top")
	createHandle(resizer, "center", "top")
	createHandle(resizer, "right", "top")
	createHandle(resizer, "right", "center")
	createHandle(resizer, "right", "bottom")
	createHandle(resizer, "center", "bottom")
	createHandle(resizer, "left", "bottom")
	createHandle(resizer, "left", "center")
	// onCreate
	if(resizer.onCreate) resizer.onCreate(args)
	// do sync
	if(resizer.sync) resizer.sync()
	return resizer
}

// common resizer methods
const commonMethods = {}

// methods that are executed on handles
function applyOnHandles(method, doSync) {
	return function(arg1, arg2) {
		for(var i=0, handles=this.handles, len=handles.length; i<len; ++i)
			handles[i][method](arg1, arg2)
		if(doSync && this.sync) this.sync()
	}
}

commonMethods.remove = applyOnHandles("remove")
commonMethods.activateHandles = applyOnHandles("activate")
commonMethods.show = applyOnHandles("show", true)
commonMethods.hide = applyOnHandles("hide")

// trigger resizer action event
commonMethods.trigger = function() {
	var target = this.target, eventKey = this.eventKey
	if(target && eventKey) target.dispatchEvent(new Event(eventKey))
}


// handles ///////////////////////////////////////////////

function createHandle(resizer, posX, posY) {
	// create handle
	var handle = document.createElement("msa-utils-resizer-handle")
	handle.setAttribute("msa-editor", true)
	var cursor = ""
	// top bottom
	handle.posY = posY
	if(posY==="top") {
		handle.style.top = "-5px"
		cursor += "n"
	} else if(posY==="bottom") {
		handle.style.bottom = "-5px"
		cursor += "s"
	} else handle.style.top = "calc(50% - 2px)"
	// left right
	handle.posX = posX
	if(posX==="left") {
		handle.style.left = "-5px"
		cursor += "w"
	} else if(posX==="right") {
		handle.style.right = "-5px"
		cursor += "e"
	} else handle.style.left = "calc(50% - 2px)"
	// cursor
	if(cursor!="") cursor += "-resize"
	handle.style.cursor = cursor
	// method
	Object.assign(handle, handleMethods)
	// listener
	handle.addEventListener("mousedown", handle.onMouseDown)
	handle.addEventListener("dblclick", handle.onDblClick)
	// append
	resizer.target.appendChild(handle)
	resizer.handles.push(handle)
	handle.resizer = resizer
}

// methods

const handleMethods = {}

handleMethods.show = function() {
	this.style.display = ''
}
handleMethods.hide = function() {
	this.style.display = 'none'
}

// activate handle (ie remove fading)
handleMethods.activate = function(xHandlesActivated, yHandlesActivated) {
	var posX = this.posX, posY = this.posY
	var activated = (!posX || xHandlesActivated) && (!posY || yHandlesActivated)
	if(activated) this.classList.add("activated")
	else this.classList.remove("activated")
}

// handle listeners
handleMethods.onMouseDown = function(evt) {
	var resizer = this.resizer
	_ResizingResizer = resizer
	_ResizingHandle = this
	if(!resizer.onStartResize) return
	resizer.resizingPosX = this.posX
	resizer.resizingPosY = this.posY
	resizer.originalMouseX = evt.pageX
	resizer.originalMouseY = evt.pageY
	resizer.onStartResize(this)
}

handleMethods.onDblClick = function() {
	var resizer = this.resizer
	if(resizer.onHandlesDblClick)
		resizer.onHandlesDblClick(this)
	resizer.trigger()
}


// document listeners ///////////////////////////////////////////////

function documentOnMouseMove(evt) {
	var resizer = _ResizingResizer
	if(!resizer || !resizer.onResize) return
	var handle = _ResizingHandle
	var newX = evt.pageX, newY = evt.pageY
	var diffX = newX-resizer.originalMouseX, diffY = newY-resizer.originalMouseY
	if(handle.posX=="left") diffX = -diffX
	if(handle.posY=="top") diffY = -diffY
	resizer.onResize(diffX, diffY, handle)
	resizer.trigger()
}

function documentOnMouseUp(evt) {
	_ResizingResizer = null
	/*evt.stopPropagation()
	evt.stopImmediatePropagation()
	evt.preventDefault()*/
}

document.addEventListener("mousemove", documentOnMouseMove)
document.addEventListener("mouseup", documentOnMouseUp)
// listen also drag events, as they may impeed mouse events to be trigerred
document.addEventListener("drag", documentOnMouseMove)
document.addEventListener("dragend", documentOnMouseUp)


// make resizable generic ///////////////////////////////////////////////

function makeResizableGeneric(target, resizable, key, methods, /*onCreate, onRemove, onStartResize, onResize, handlesOnDblClick, sync,*/ eventKey, args) {
	if(resizable===undefined) resizable = true
	if(typeof target==="string") target = document.querySelector(target)
	var resizer = target[key]
	if(resizable) {
		if(resizer) return
		resizer = createResizer(target, methods, eventKey, args)
		target[key] = resizer
		if(eventKey) target.addEventListener(eventKey, syncMyResizer)
	} else {
		if(!resizer) return
		if(resizer.onRemove) resizer.onRemove()
		resizer.remove()
		delete target[key]
		if(eventKey) target.removeEventListener(eventKey, syncMyResizer)
	}
	return resizer
}

function syncMyResizer() {
	var resizer = this.msaUtilsResizer
	if(resizer && resizer.sync) resizer.sync()
}


// make resizable ///////////////////////////////////////////////
// Specific functions for resizer acting on "size"

const resizableMethods = {}

resizableMethods.onCreate = function(args) {
	this.updateTargetPosition = defArg(args, "updateTargetPosition", true)
	// make target have a relative pos (if requested & needed)
	if(this.updateTargetPosition) {
		var target = this.target, targetStyle = target.style
		var compStyle = window.getComputedStyle(target)
		var targetPosition = compStyle.position
		var relativeToTarget = (targetPosition=="absolute" || targetPosition=="relative")
		if(!relativeToTarget) {
			backup(target, {
				key: "msaUtilsResizerPos",
				style: [ "position", "top", "bottom", "left", "right" ]
			})
			targetStyle.position = "relative"
			targetStyle.top = ""
			targetStyle.bottom = ""
			targetStyle.left = ""
			targetStyle.right = ""
		}
	}
}

resizableMethods.onRemove = function() {
	// remove target relative position (if requested & if no pos delta)
	if(this.updateTargetPosition) {
		var target = this.target, style = target.style
		var compStyle = window.getComputedStyle(target)
		var isEmptyRel = (
			style.position=="relative"
			&& compStyle.top=="0px"
			&& compStyle.bottom=="0px"
			&& compStyle.left=="0px"
			&& compStyle.right=="0px"
		)
		if(isEmptyRel)
			restore(this.target, { key: "msaUtilsResizerPos" })
	}
}

resizableMethods.onStartResize = function() {
	var compStyle = window.getComputedStyle(this.target)
	this.originalTargetWidth = parseFloat(compStyle.width)
	this.originalTargetHeight = parseFloat(compStyle.height)
	this.resizeStarted = false
}

resizableMethods.onResize = function(diffX, diffY, handle) {
	var target = this.target
	var posX = handle.posX, posY = handle.posY
	// update width or height
	if(posX) target.style.width = (this.originalTargetWidth+diffX)+"px"
	if(posY) target.style.height = (this.originalTargetHeight+diffY)+"px"
	// remove attr style that may impeed width & height to apply
	if(!this.resizeStarted) removeStretch(this, handle)
	this.resizeStarted = true
}

resizableMethods.onHandlesDblClick = function(handle) {
	var target = this.target
	var posX = handle.posX, posY = handle.posY
	// remove width or height
	if(posX) target.style.width = ""
	if(posY) target.style.height = ""
	// switch between "stretch" & "just"
	switchStretchToJust(this, handle)
}

function removeStretch(resizer, handle) {
	var target = resizer.target
	var posX = handle.posX, posY = handle.posY
	// determine flex direction
	var flexDir = getFlexDirection(target)
	var compStyle = window.getComputedStyle(target)
	// if handle manages flex direction
	if((posX && flexDir=='x') || (posY && flexDir=='y')) {
		// justify (if needed)
		if(isFlexStretch(target, compStyle))
			setFlexJust(resizer, compStyle)
	}
	// if handle manages non-flex direction
	if((posX && flexDir=='y') || (posY && flexDir=='x')) {
		// justify (if needed)
		if(isAlignStretch(target, compStyle))
			setAlignJust(resizer, compStyle)
	}
}

function switchStretchToJust(resizer, handle) {
	var target = resizer.target
	var posX = handle.posX, posY = handle.posY
	// determine flex direction
	var flexDir = getFlexDirection(target)
	// determine position
	var compStyle = window.getComputedStyle(target)
	var pos = (compStyle.position=="absolute") ? "float" : "inline"
	// if handle manages flex direction
	if((posX && flexDir=='x') || (posY && flexDir=='y')) {
		// if target floating: justify
		if(pos=="float") setFlexJust(resizer, compStyle)
		// if something is backuped: restore it
		else if(restore(target, { key: "msaUtilsFlex" })) {}
		// else switch between stretch & justify
		else if(isFlexStretch(target, compStyle)) setFlexJust(resizer, compStyle)
		else setFlexStretch(resizer, compStyle)
	}
	// if handle manages non-flex direction
	if((posX && flexDir=='y') || (posY && flexDir=='x')) {
		// if target floating: justify
		if(pos=="float") setAlignJust(resizer, compStyle)
		// if something is backuped: restore it
		else if(restore(target, { key: "msaUtilsAlignSelf" })) {}
		// else switch between stretch & justify
		else if(isAlignStretch(target, compStyle)) setAlignJust(resizer, compStyle)
		else setAlignStretch(resizer, compStyle)
	}
}

resizableMethods.sync = function() {
	var target = this.target
	this.handles.forEach(h => setPositionRelativeTo(h, target, h.posX, h.posY))
	// activate handles
	var flex = getFlex(target)
	var xHandlesActivated = (target.style.width != false && flex!='x')
	var yHandlesActivated = (target.style.height != false && flex!='y')
	this.activateHandles(xHandlesActivated, yHandlesActivated)
}

// main function
export function makeResizable(target, resizable, args) {
	var resizer = makeResizableGeneric(target, resizable,
		"msaUtilsResizer",
		resizableMethods,
		"resize",
		args)
	return resizer
}


// various ///////////////////////////////////////////////

// determine if parent node has set "flexDirection", and which one
function getFlexDirection(target) {
	var parentStyle = window.getComputedStyle(target.parentNode)
	if(parentStyle.display == "flex") {
		var parentFlexDirection = parentStyle.flexDirection
		if(parentFlexDirection == "row" || parentFlexDirection == "row-reverse")
			return 'x'
		else if(parentFlexDirection == "column" || parentFlexDirection == "column-reverse")
			return 'y'
	}
	return false
}

// determine if target "flex" is active, and in which direction
function getFlex(target) {
	if(isFlexStretch(target))
		return getFlexDirection(target)
	return false
}

// tell if target is stretch in flex direction
function isFlexStretch(target, compStyle) {
	if(!compStyle) compStyle = window.getComputedStyle(target)
	return (compStyle.flexGrow!="0")
}

// tell if target is stretch in non-flex direction
function isAlignStretch(target, compStyle) {
	if(!compStyle) compStyle = window.getComputedStyle(target)
	return (compStyle.alignSelf=="stretch")
}

// justify target in flex direction
function setFlexJust(resizer, compStyle) {
	backUpd(resizer.target, "msaUtilsFlex", "flex", "none")
}

// stretchify target in flex direction
function setFlexStretch(resizer, compStyle) {
	backUpd(resizer.target, "msaUtilsFlex", "flex", "1")
}

// justify target in non-flex direction
function setAlignJust(resizer, compStyle) {
	if(!compStyle) compStyle = window.getComputedStyle(resizer.target)
	if(compStyle.alignSelf==="stretch") {
		backUpd(resizer.target, "msaUtilsAlignSelf", "alignSelf", "flex-start")
	}
}

// stretchify target in non-flex direction
function setAlignStretch(resizer, compStyle) {
	backUpd(resizer.target, "msaUtilsAlignSelf", "alignSelf", "stretch")
}

// argument default value
function defArg(args, key, defArg) {
	var val = args && args[key]
	return (val!==undefined) ? val : defArg
}

// backup & restore style
function backUpd(target, key, styleAttr, newVal) {
	backup(target, {
		key: key,
		style: [styleAttr]
	})
	target.style[styleAttr] = newVal
}

