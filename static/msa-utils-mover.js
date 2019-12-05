import { importHtml } from "/utils/msa-utils.js"

// style

importHtml(`<style>
	msa-utils-mover {
		position: absolute;
		top: 0;
		left: -32px;
	}
	msa-utils-mover input {
		cursor: move;
		padding: 3px;
		width: 24px;
		height: 24px;
		border: 1px solid #aaa;
		border-right: 0;
		border-radius: 5px 0px 0px 5px;
		box-shadow: -1pt 1pt 2pt 1pt #aaa;
		background: white;
	}
</style>`)

// template

const template = `
	<input type="image" src='data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22%23999%22%20viewBox%3D%220%200%201024%201024%22%3E%3Cpath%20class%3D%22path1%22%20d%3D%22M512%200q18%200%2030.333%2012.333l150.667%20151q12.667%2012.667%2012.667%2030.333t-12.5%2030.167-30.167%2012.5-30.333-12.667l-78-78v323.667h323.667l-78-78q-12.667-12.667-12.667-30.333t12.5-30.167%2030.167-12.5%2030.333%2012.667l151%20150.667q12.333%2012.333%2012.333%2030.333t-12.333%2030l-151%20151q-12.667%2012.667-30.333%2012.667t-30.167-12.5-12.5-30.167%2012.667-30.333l78-78h-323.667v323.667l78-78q12.667-12.667%2030.333-12.667t30.167%2012.5%2012.5%2030.167-12.667%2030.333l-150.667%20151q-12.333%2012.333-30.333%2012.333-17.667%200-30-12.333l-151-151q-12.667-12.667-12.667-30.333t12.5-30.167%2030.167-12.5%2030.333%2012.667l78%2078v-323.667h-323.667l78%2078q12.667%2012.667%2012.667%2030.333t-12.5%2030.167-30.167%2012.5-30.333-12.667l-151-150.667q-12.333-12.333-12.333-30.333t12.333-30.333l151-150.667q12.667-12.667%2030.333-12.667t30.167%2012.5%2012.5%2030.167-12.667%2030.333l-78%2078h323.667v-323.667l-78%2078q-12.667%2012.667-30.333%2012.667t-30.167-12.5-12.5-30.167%2012.667-30.333l150.667-151q12.333-12.333%2030.333-12.333z%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E' />`


// mover ///////////////////////////////////////////

var _MovingMover = null

export class HTMLMsaUtilsMoverElement extends HTMLElement {}
const MsaUtilsMoverPt = HTMLMsaUtilsMoverElement.prototype

MsaUtilsMoverPt.connectedCallback = function() {
	this.innerHTML = this.getTemplate()
	this.setAttribute("msa-editor", true)
	this.addEventListener("mousedown", evt => this.move(evt))
	this.link(this.parentNode)
}

MsaUtilsMoverPt.getTemplate = function() {
	return template
}

MsaUtilsMoverPt.disconnectedCallback = function() {
	this.unlink()
}

MsaUtilsMoverPt.link = function(target) {
	this.target = target
	target.msaUtilsMover = this
}
MsaUtilsMoverPt.unlink = function(target) {
	delete this.target.msaUtilsMover
	delete this.target
}

MsaUtilsMoverPt.show = function() {
	this.style.display = ""
}
MsaUtilsMoverPt.hide = function() {
	this.style.display = "none"
}

MsaUtilsMoverPt.move = function(evt){
	var target = this.target
	if(!target) return
	_MovingMover = this
	// save target position
	var style = target.style,
		compStyle = window.getComputedStyle(target)
	this.targetPosAttrX = style.left ? "left" : ( style.right ? "right" : "left" )
	this.targetPosAttrY = style.top ? "top" : ( style.bottom ? "bottom" : "top" )
	var sizeX = style[this.targetPosAttrX] || compStyle[this.targetPosAttrX]
	var sizeY = style[this.targetPosAttrY] || compStyle[this.targetPosAttrY]
	this.oldTargetPosValX = parseFloat(getPosVal(sizeX))
	this.oldTargetPosValY = parseFloat(getPosVal(sizeY))
	this.targetPosUnitX = getPosUnit(sizeX)
	this.targetPosUnitY = getPosUnit(sizeY)
	this.oldTargetOffsetX = target.offsetLeft
	this.oldTargetOffsetY = target.offsetTop
	this.oldMouseX = evt.pageX
	this.oldMouseY = evt.pageY
	// avoid selecting content in page
	evt.preventDefault()
}

// register elem
customElements.define("msa-utils-mover", HTMLMsaUtilsMoverElement)


// document listener //////////////////////////////////////////////

document.addEventListener("mouseup", function(evt){
	_MovingMover = null
})
document.addEventListener("mousemove", function(evt){
	var mover = _MovingMover
	if(!mover) return
	// determine mouse movement
	var mouseDiffX = evt.pageX - mover.oldMouseX
	var mouseDiffY = evt.pageY - mover.oldMouseY
	// update target style
	var target = mover.target
	var signDiffX = ((mover.targetPosAttrX==="left") ? 1 : -1)
	var signDiffY = ((mover.targetPosAttrY==="top") ? 1 : -1)
	target.style[mover.targetPosAttrX] = (mover.oldTargetPosValX + mouseDiffX*signDiffX) + mover.targetPosUnitX
	target.style[mover.targetPosAttrY] = (mover.oldTargetPosValY + mouseDiffY*signDiffY) + mover.targetPosUnitY
	// if the target pos units are not "px", check difference between expected & computed move diff, anf fix this
	if(mover.targetPosUnitX!="px") {
		var targetComputedDiffX = target.offsetLeft - mover.oldTargetOffsetX
		var targetMoveRatioX = computeRatio(mouseDiffX, targetComputedDiffX)
		target.style[mover.targetPosAttrX] = (mover.oldTargetPosValX + (mouseDiffX * signDiffX * targetMoveRatioX)).toFixed(1) + mover.targetPosUnitX
	}
	if(mover.targetPosUnitY!="px") {
		var targetComputedDiffY = target.offsetTop - mover.oldTargetOffsetY
		var targetMoveRatioY = computeRatio(mouseDiffY, targetComputedDiffY)
		target.style[mover.targetPosAttrY] = (mover.oldTargetPosValY + (mouseDiffY * signDiffY * targetMoveRatioY)).toFixed(1) + mover.targetPosUnitY
	}
	// trigger "move" event
	target.dispatchEvent(new Event("move"))
})



// utils ///////////////////////////////////////////////

const isSize = function(size) {
	return size.search(/^[0-9.]+[px%]+$/)!=-1
}
const getSizeVal = function(size) {
	return size.match(/^[0-9.]*/)[0]
}
const getSizeUnit = function(size) {
	return size.match(/[a-z%]*$/)[0]
}

const getPosVal = function(size) {
	return size.match(/^[0-9.]*/)[0]
}
const getPosUnit = function(size) {
	return size.match(/[a-z%]*$/)[0]
}
const computeRatio = function(val1, val2) {
	if(val1===0 && val2===0) return 1
	return val1 / val2
}



// main function ////////////////////////////////////////

export function makeMovable(target, movable) {
	if(movable===undefined) movable = true
	if(typeof target==="string") target = document.querySelectorAll(target)
	var mover = target.msaUtilsMover
	if(movable) {
		// create & reference mover (if not already exists)
		if(mover) return
		mover = target.msaUtilsMover = document.createElement("msa-utils-mover")
		target.appendChild(mover)
	} else {
		// remove & de-reference mover (if exists)
		if(!mover) return
		mover.remove()
		delete target.msaUtilsMover
	}
	return mover
}
