import { Q, importHtml, importOnCall } from "/msa/msa.js"

const moverDeps = `
	<script type="module" src="/utils/msa-utils-mover.js"></script>`
const makeMovable = importOnCall(moverDeps, "MsaUtilsMover.makeMovable")

const MsaUtilsPopup = window.MsaUtilsPopup = {}

// SVGs
importHtml({ body:
`<svg id="msa-utils-popup-svg" style="display:none">
	<!-- close icon -->
	<symbol id="msa-utils-popup-close" viewBox="0 0 100 100" stroke="#999" stroke-width="10" stroke-linecap="round">
		<path d="m5 5l90 90"></path>
		<path d="m5 95l90 -90"></path>
	</symbol>
</svg>` }, document.body)

// style
importHtml(`<style>
	.msa-utils-popup {
		position: absolute;
		top: 50px;
		left: 50px;
		background: white;
		padding: 15px;
		box-shadow: 1pt 1pt 2pt 1pt #aaa;
	}
	.msa-utils-popup-buttons {
		text-align: right;
	}
	.msa-utils-popup-buttons button {
		margin-left: 10px;
	}
	.msa-utils-popup-close-icon {
		display: block-inline;
		position: absolute;
		top: 3px;
		right: 3px;
	}
	.msa-utils-popup-close-icon svg {
		width: 7px;
		height: 7px;
		padding: 2px;
		margin: 0;
		cursor: pointer;
		background-color: white;
		border-radius: 2px;
		border: 1px solid #999;
	}
	.msa-utils-popup-close-icon svg:hover {
		background-color: #EEE;
	}
	msa-utils-popup-confirm p, msa-utils-popup-input p {
		margin: 0px 0px 10px 0px;
	}
</style>̀`)

// popup /////////////////////////////////

export class HTMLMsaUtilsPopupElement extends HTMLElement {
	connectedCallback(){
		this.classList.add("msa-utils-popup")
		makeMovable(this)
		if(this.getAttribute("close-icon") !== "false")
			this.addCloseIcon()
	}
	addCloseIcon(){
		const closeIcon = document.createElement("div")
		closeIcon.className = "msa-utils-popup-close-icon"
		closeIcon.innerHTML = '<svg><use xlink:href="#msa-utils-popup-close"></use></svg>'
		this.appendChild(closeIcon)
		closeIcon.onclick = () => { this.cancel() }
	}
	cancel(){
		this.dispatchEvent(new Event("cancel"))
		this.remove()
	}
}
MsaUtilsPopup.HTMLMsaUtilsPopupElement = HTMLMsaUtilsPopupElement
HTMLMsaUtilsPopupElement.prototype.Q = Q

// register custom elem
customElements.define("msa-utils-popup", HTMLMsaUtilsPopupElement)

/*
export function createPopup(el, args) {
	// if el is string, create element with this name
	if(typeof el=="string") el = document.createElement(el)
	// make el as popup
	el.classList.add("msa-utils-popup")
	MsaUtils.makeMovable(el)
	if(!args) args = {}
	// callbacks
	if(!el.msaUtilsPopupActs) el.msaUtilsPopupActs = popupActs
	el.msaUtilsPopupOnClose = args.onClose
	el.msaUtilsPopupOnCancel = args.onCancel
	// buttons
	var buttons = args.buttons
	if(buttons) {
		for(var i=0, len=buttons.length; i<len; ++i) {
			addButton(el, buttons[i])
		}
	}
	// close icon
	var addCloseIcon = defArg(args.addCloseIcon, true)
	if(addCloseIcon) {
		var closeIcon = document.createElement("div")
		closeIcon.className = "msa-utils-popup-close-icon"
		closeIcon.innerHTML = '<svg><use xlink:href="#msa-utils-popup-close"></use></svg>'
		el.appendChild(closeIcon)
		closeIcon.popup = el
		closeIcon.onclick = closeIconOnClick
	}
	// TODO: place popup in function of screen scrolling
	// insert popup
	document.body.appendChild(el)
	return el
}

// popup acts

var popupOnCancel = function() {
	if(this.msaUtilsPopupOnCancel)
		this.msaUtilsPopupOnCancel()
}
var popupActs = {}
popupActs["cancel"] = popupOnCancel

// close

var closePopup = function(popup) {
	if(popup.msaUtilsPopupOnClose)
		popup.msaUtilsPopupOnClose()
	document.body.removeChild(popup)
}
var closeIconOnClick = function() {
	var popup = this.popup
	popupOnCancel.call(popup)
	closePopup(popup)
}

// button /////////////////////////////////

var addButton = function(popup, button) {
	// create button element
	var buttonEl = document.createElement("button")
	buttonEl.popup = popup
	buttonEl.onclick = buttonOnClick
	// button text
	var act = button.act
	buttonEl.textContent = defArg(button.text, 
		(act==="cancel") ? "Cancel" : "OK")
	// act
	if(typeof act==="string")
		var act = popup.msaUtilsPopupActs[act]
	buttonEl.act = act
	// closePopup
	buttonEl.closePopup = defArg(button.closePopup, true)
	// get buttonsDiv (create it if needed)
	var buttonsDiv = popup.querySelector(".msa-utils-popup-buttons")
	if(!buttonsDiv) {
		buttonsDiv = document.createElement("div")
		buttonsDiv.className = "msa-utils-popup-buttons"
		popup.appendChild(buttonsDiv)
	}
	//insert button in buttonsDiv
	buttonsDiv.appendChild(buttonEl)
	return buttonEl
}

var buttonOnClick = function(){
	var popup = this.popup
	// act
	var act = this.act
	if(act) act.call(popup)
	// close
	if(this.closePopup)
		closePopup(popup)
}
*/

// confirm /////////////////////////////////

const contentConfirm = `
	<p class="text"></p>
	<div style="text-align:right">
		<button class="yes">Yes</button> 
		<button class="no">No</button>
	</div>
`

export class HTMLMsaUtilsPopupConfirmElement extends HTMLMsaUtilsPopupElement {
	connectedCallback(){
		const text = this.textContent
		this.initContent()
		super.connectedCallback()
		this.setText(text)
		this.initButtons()
	}
	initContent(){
		this.innerHTML = contentConfirm
	}
	setText(text){
		this.Q(".text").textContent = text
	}
	initButtons(){
		this.Q("button.yes").onclick = () => {
			this.confirm()
		}
		this.Q("button.no").onclick = () => {
			this.cancel()
		}
	}
	confirm(){
		this.dispatchEvent(new Event("confirm"))
		this.remove()
	}
}
MsaUtilsPopup.HTMLMsaUtilsPopupConfirmElement = HTMLMsaUtilsPopupConfirmElement

// register custom elem
customElements.define("msa-utils-popup-confirm", HTMLMsaUtilsPopupConfirmElement)

// create confirm popup
export function createConfirmPopup(text, onConfirm) {
	// create el from text
	const popup = document.createElement("msa-utils-popup-confirm")
	popup.textContent = text
	if(onConfirm) popup.addEventListener("confirm", onConfirm)
	// focus first button
	document.body.appendChild(popup)
	popup.Q(".msa-utils-popup-buttons button").focus()
	return popup
}
MsaUtilsPopup.createConfirmPopup = createConfirmPopup
/*
// confirm popup acts

var confirmOnConfirm = function() {
	if(this.msaUtilsPopupOnConfirm)
		this.msaUtilsPopupOnConfirm()
}
var confirmPopupActs = Object.assign({}, popupActs)
confirmPopupActs["confirm"] = confirmOnConfirm

// register confirm popup

Msa.registerElement("msa-utils-popup-confirm", {
	template:"#msa-utils-popup-confirm"
})
*/
// input /////////////////////////////////

// content
const contentInput = `
	<p class="text"></p>
	<p><input type="text"></p>
	<div style="text-align:right">
		<button class="yes">Yes</button> 
		<button class="no">No</button>
	</div>
`

export class HTMLMsaUtilsPopupInputElement extends HTMLMsaUtilsPopupElement {
	connectedCallback(){
		const text = this.textContent
		this.initContent()
		super.connectedCallback()
		this.setText(text)
		if(this.hasAttribute("type"))
			this.setInputType(this.getAttribute("type"))
		this.initButtons()
	}
	initContent(){
		this.innerHTML = contentInput
	}
	setText(text){
		this.Q(".text").textContent = text
	}
	setInputType(type){
		this.Q("input").type = type
	}
	initButtons(){
		this.Q("input").onkeydown = evt => {
			if(evt.key === "Enter") {
				this.input()
			}
		}
		this.Q("button.yes").onclick = () => {
			this.input()
		}
		this.Q("button.no").onclick = () => {
			this.cancel()
		}
	}
	input(){
		const val = this.Q("input").value
		this.dispatchEvent(new Event("input", { detail: val }))
		this.remove()
	}
}
MsaUtilsPopup.HTMLMsaUtilsPopupInputElement = HTMLMsaUtilsPopupInputElement

export function createInputPopup(text, arg1, arg2) {
	if(typeof arg1 === "function") var onInput=arg1
	else var args=arg1, onInput=arg2
	// create element from text
	var popup = document.createElement("msa-utils-popup-input")
	popup.textContent = text
	if(args && args.type)
	popup.setAttribute("type", args.type)
	if(onInput)
		popup.addEventListener("input", evt => {
			onInput(evt.detail)
		})
	// focus on input
	document.body.appendChild(popup)
	popup.Q("input").focus()
	return popup
}
MsaUtilsPopup.createInputPopup = createInputPopup

// register custom elem
customElements.define("msa-utils-popup-input", HTMLMsaUtilsPopupInputElement)

/*
// on input key press
var inputOnKeyPress = function(e) {
	if(e.which == 13) {
		var popup = this.popup
		popup.msaUtilsPopupActs["input"].call(popup)
		closePopup(popup)
	}
}

// input popup acts

var inputOnInput = function() {
	if(this.msaUtilsPopupOnInput) {
		var val = this.querySelector("input").value
		this.msaUtilsPopupOnInput(val)
	}
}
var inputPopupActs = Object.assign({}, popupActs)
inputPopupActs["input"] = inputOnInput

// register web component

Msa.registerElement("msa-utils-popup-input", {
	template:"#msa-utils-popup-input"
})
*/
// common ///////////////////////////////////
/*
var defArg = function(arg, defVal) {
	return (arg===undefined) ? defVal : arg
}
*/
// publish //////////////////////////////////
/*
if(!document.MsaUtils) document.MsaUtils = MsaUtils = {}
MsaUtils.createPopup = createPopup
MsaUtils.createConfirmPopup = createConfirmPopup
MsaUtils.createInputPopup = createInputPopup
*/
