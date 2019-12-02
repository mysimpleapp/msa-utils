import { Q, importHtml, importOnCall } from "/msa/msa.js"

const moverDeps = `
	<script type="module" src="/utils/msa-utils-mover.js"></script>`
const makeMovable = importOnCall(moverDeps, "MsaUtils.makeMovable")

if(!window.MsaUtils) MsaUtils = window.MsaUtils = {}

// SVGs
importHtml(`<svg id="msa-utils-popup-svg" style="display:none">
	<!-- close icon -->
	<symbol id="msa-utils-popup-close" viewBox="0 0 100 100" stroke="#999" stroke-width="10" stroke-linecap="round">
		<path d="m5 5l90 90"></path>
		<path d="m5 95l90 -90"></path>
	</symbol>
</svg>`, document.body)

// style
importHtml(`<style>
	.msa-utils-popup {
		position: absolute;
		top: 50px;
		left: 50px;
		background: white;
		padding: 0 15px;
		box-shadow: 1pt 1pt 2pt 1pt #aaa;
		z-index: 100;
	}
	.msa-utils-popup .buttons {
		text-align: right;
	}
	.msa-utils-popup .buttons button {
		margin-left: 10px;
	}
	.msa-utils-popup .close-icon {
		display: block-inline;
		position: absolute;
		top: 3px;
		right: 3px;
	}
	.msa-utils-popup .close-icon svg {
		width: 7px;
		height: 7px;
		padding: 2px;
		margin: 0;
		cursor: pointer;
		background-color: white;
		border-radius: 2px;
		border: 1px solid #999;
	}
	.msa-utils-popup .close-icon svg:hover {
		background-color: #EEE;
	}
</style>̀`)

// popup /////////////////////////////////

const popupTemplate = `
<h1 class="title" style="display:none"></h1>
<p class="text" style="display:none"></p>
<p class="content"></p>
<p class="buttons" style="display:none"></p>
`

export class HTMLMsaUtilsPopupElement extends HTMLElement {

	connectedCallback(){
		this.classList.add("msa-utils-popup")
		this.innerHTML = this.getTemplate()
		this.initTitle()
		this.initText()
		this.initContent()
		this.initButtons()
		if(this.getAttribute("close-icon") !== "false")
			this.addCloseIcon()
		this.centerOnVisibleArea()
		makeMovable(this)
	}

	getTemplate(){
		return popupTemplate
	}

	getContent(){}
	initContent(){
		const content = this.getContent()
		if(content){
			const contentEl = asDom(content)
			this.Q(".content").appendChild(contentEl)
			this.content = contentEl
		}
	}

	getTitle(){}
	initTitle(){
		const title = this.getTitle()
		if(title){
			const titleEl = this.Q(".title")
			titleEl.style.display = ""
			titleEl.textContent = title
		}
	}

	getText(){}
	initText(){
		const text = this.getText()
		if(text){
			const textEl = this.Q(".text")
			textEl.style.display = ""
			textEl.textContent = text
		}
	}

	getButtons(){}
	initButtons(){
		const buttons = this.getButtons()
		if(buttons){
			const buttonsEl = this.Q(".buttons")
			buttonsEl.style.display = ""
			for(const b in buttons)
				buttonsEl.appendChild(buttons[b])
		}
	}

	addCloseIcon(){
		const closeIcon = document.createElement("div")
		closeIcon.className = "close-icon"
		closeIcon.innerHTML = '<svg><use xlink:href="#msa-utils-popup-close"></use></svg>'
		this.appendChild(closeIcon)
		closeIcon.onclick = () => this.cancel()
	}

	centerOnVisibleArea() {
		const sw = window.innerWidth, sh = window.innerHeight
		this.style.left = 0
		this.style.top = 0
		const rect = this.getBoundingClientRect()
		const x = rect.left, y = rect.top
		const w = rect.right - rect.left, h = rect.bottom - rect.top
		this.style.left = ((sw-w)/2-x) +"px"
		this.style.top = ((sh-h)/2-y) +"px"
	}

	cancel(){
		this.dispatchEvent(new Event("cancel"))
		this.remove()
	}
}
MsaUtils.HTMLMsaUtilsPopupElement = HTMLMsaUtilsPopupElement
HTMLMsaUtilsPopupElement.prototype.Q = Q

customElements.define("msa-utils-popup", HTMLMsaUtilsPopupElement)


function _createPopup(dom, kwargs){
	const popupTagName = getArg(kwargs, "popupTagName", "msa-utils-popup")
	const popup = document.createElement(popupTagName)
	// title
	const title = getArg(kwargs, "title")
	if(title) popup.getTitle = () => title
	// text
	const text = getArg(kwargs, "text")
	if(text) popup.getText = () => text
	// content
	if(dom) popup.getContent = () => dom
	// closeOn
	const closeOn = getArg(kwargs, "closeOn")
	if(closeOn)
		dom.addEventListener(closeOn, () => popup.remove())
	return popup
}


export function addPopup(parent, dom, kwargs) {
	const popup = _createPopup(dom, kwargs)
	parent.appendChild(popup)
	return popup
}
MsaUtils.addPopup = addPopup


export function createPopup(dom, kwargs) {
	console.warn("MsaPopup.createPopup is DEPRECATED !\n"+(new Error().stack))
	return addPopup(document.body, dom, kwargs)
}
MsaUtils.createPopup = createPopup


export async function importAsPopup(parent, html, kwargs) {
	if(!(html instanceof HTMLElement)){
		html = (await importHtml(html, true))[0]
	}
	return addPopup(parent, html, kwargs)
}
MsaUtils.importAsPopup = importAsPopup


// message /////////////////////////////////

export class HTMLMsaUtilsPopupMessageElement extends HTMLMsaUtilsPopupElement {
	getButtons(){
		const okBut = document.createElement("button")
		okBut.textContent = "OK"
		okBut.classList.add("ok")
		okBut.onclick = () => this.remove()
		return [okBut]
	}
}
MsaUtils.HTMLMsaUtilsPopupMessageElement = HTMLMsaUtilsPopupMessageElement

customElements.define("msa-utils-popup-message", HTMLMsaUtilsPopupMessageElement)


export function addMessagePopup(parent, dom, kwargs) {
	const popup = addPopup(parent, dom,
		{ "popupTagName":"msa-utils-popup-message" , ...kwargs })
	popup.Q("button.ok").focus()
	return popup
}
MsaUtils.addMessagePopup = addMessagePopup



// confirm /////////////////////////////////

export class HTMLMsaUtilsPopupConfirmElement extends HTMLMsaUtilsPopupElement {
	getButtons(){
		const yesBut = document.createElement("button")
		yesBut.textContent = "Yes"
		yesBut.classList.add("yes")
		yesBut.onclick = () => this.confirm()
		const noBut = document.createElement("button")
		noBut.textContent = "No"
		noBut.classList.add("no")
		noBut.onclick = () => this.cancel()
		return [yesBut, noBut]
	}
	confirm(){
		this.dispatchEvent(new Event("confirm"))
		this.remove()
	}
}
MsaUtils.HTMLMsaUtilsPopupConfirmElement = HTMLMsaUtilsPopupConfirmElement

customElements.define("msa-utils-popup-confirm", HTMLMsaUtilsPopupConfirmElement)


export function addConfirmPopup(parent, dom, onConfirm, kwargs) {
	const popup = addPopup(parent, dom,
		{ "popupTagName":"msa-utils-popup-confirm" , ...kwargs })
	popup.Q("button.no").focus()
	if(onConfirm) popup.addEventListerner("confirm", onConfirm)
	return popup
}
MsaUtils.addConfirmPopup = addConfirmPopup


export function createConfirmPopup(dom, onConfirm, kwargs) {
	console.warn("MsaPopup.createConfirmPopup is DEPRECATED !\n"+(new Error().stack))
	return addConfirmPopup(document.body, dom, onConfirm, kwargs)
}
MsaUtils.createConfirmPopup = createConfirmPopup


// input /////////////////////////////////

export class HTMLMsaUtilsPopupInputElement extends HTMLMsaUtilsPopupElement {
	getContent(){
		const inputEl = document.createElement("input")
		inputEl.classList.add("input")
		const inputType = this.getAttribute("type") || "text"
		inputEl.type = inputType
		if(this.hasAttribute("value"))
			this.setValue(this.getAttribute("value"))
		if(inputType==="text"){
			inputEl.onkeydown = evt => {
				if(evt.key === "Enter") {
					this.validate()
				}
			}
		}
		return inputEl
	}
	getButtons(){
		const yesBut = document.createElement("button")
		yesBut.textContent = "Yes"
		yesBut.classList.add("yes")
		yesBut.onclick = () => this.validate()
		const noBut = document.createElement("button")
		noBut.textContent = "No"
		noBut.classList.add("no")
		noBut.onclick = () => this.cancel()
		return [yesBut, noBut]
	}
	validate(){
		const val = this.Q("input").value
		this.dispatchEvent(new CustomEvent("validate", { detail: val }))
		this.remove()
	}
}
MsaUtils.HTMLMsaUtilsPopupInputElement = HTMLMsaUtilsPopupInputElement

customElements.define("msa-utils-popup-input", HTMLMsaUtilsPopupInputElement)


export function addInputPopup(parent, text, arg1, arg2) {
	if(typeof arg1 === "function") var onValidate=arg1
	else var kwargs=arg1, onValidate=arg2
	const popup = _createPopup(null,
		{ "popupTagName":"msa-utils-popup-input" , ...kwargs })
	popup.getText = () => text
	if(kwargs && kwargs.type)
		popup.setAttribute("type", kwargs.type)
	if(kwargs && kwargs.value != undefined)
		popup.setAttribute("value", kwargs.value)
	if(onValidate)
		popup.addEventListener("validate", evt => {
			onValidate(evt.detail)
		})
	parent.appendChild(popup)
	popup.Q("input").focus()
	return popup
}
MsaUtils.addInputPopup = addInputPopup


export function createInputPopup(dom, arg1, arg2){
	console.warn("MsaPopup.createInputPopup is DEPRECATED !\n"+(new Error().stack))
	return addInputPopup(document.body, dom, arg1, arg2)
}
MsaUtils.createInputPopup = createInputPopup


// utils /////////////////////////////

function getArg(obj, key, defVal){
	if(!obj) return defVal
	const val = obj[key]
	return (val === undefined) ? defVal : val
}

function asDom(d){
	if(d instanceof HTMLElement)
		return d
	if(typeof d === "string"){
		const div = document.createElement('div')
		div.innerHTML = d
		return div
	}
}