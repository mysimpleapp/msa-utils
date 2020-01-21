import { Q, importHtml, importOnCall } from "/utils/msa-utils.js"

const makeMovable = importOnCall("/utils/msa-utils-mover.js", "makeMovable")

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
	.msa-utils-popup .icon > * {
		margin: 10px 10px 10px 0;
		width: 50px;
		height: 50px;
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

// msa-utils-popup /////////////////////////////////

const popupTemplate = `
<div style="display:flex; flex-direction:row">
	<div class="icon" style="display:none"></div>
	<div>
		<h1 class="title" style="display:none"></h1>
		<p class="text" style="display:none"></p>
		<p class="content"></p>
		<p class="buttons" style="display:none"></p>
	</div>
</div>
`

export class HTMLMsaUtilsPopupElement extends HTMLElement {

	connectedCallback(){
		this.classList.add("msa-utils-popup")
		this.innerHTML = this.getTemplate()
		this.initIcon()
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
		const content = asDom(this.getContent())
		if(content) {
			this.Q(".content").appendChild(content)
			this.content = content
		}
	}

	getIcon(){}
	initIcon(){
		const icon = this.getIcon()
		if(icon){
			const iconEl = this.Q(".icon")
			iconEl.appendChild(asImg(icon))
			iconEl.style.display = ""
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
			this.Q(".buttons").style.display = ""
			for(const b of buttons)
				this.addButton(b)
		}
	}
	addButton(but){
		let butEl
		if(but instanceof HTMLElement) {
			butEl = but
		} else {
			butEl = document.createElement("button")
			butEl.textContent = but.text
			if(but.fun){
				butEl.addEventListener("click", () => {
					but.fun.call(this)
					if(but.close !== false) this.remove()
				})
			} else {
				butEl.addEventListener("click", () => this.cancel())
			}
		}
		this.Q(".buttons").appendChild(butEl)
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
HTMLMsaUtilsPopupElement.prototype.Q = Q

customElements.define("msa-utils-popup", HTMLMsaUtilsPopupElement)


function _createPopup(dom, kwargs){
	const popupTagName = getArg(kwargs, "popupTagName", "msa-utils-popup")
	const popup = document.createElement(popupTagName)
	// icon
	const icon = getArg(kwargs, "icon")
	if(icon) popup.getIcon = () => icon
	// title
	const title = getArg(kwargs, "title")
	if(title) popup.getTitle = () => title
	// text
	const text = getArg(kwargs, "text")
	if(text) popup.getText = () => text
	// content
	if(dom) popup.getContent = () => dom
	// buttons
	const buttons = getArg(kwargs, "buttons")
	if(buttons) popup.getButtons = () => buttons
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


export async function importAsPopup(parent, html, kwargs) {
	if(!(html instanceof HTMLElement)){
		html = (await importHtml(html, true))[0]
	}
	return addPopup(parent, html, kwargs)
}


// msa-utils-popup-message /////////////////////////////////

export class HTMLMsaUtilsPopupMessageElement extends HTMLMsaUtilsPopupElement {
	getButtons(){
		const okBut = document.createElement("button")
		okBut.textContent = "OK"
		okBut.classList.add("ok")
		okBut.onclick = () => this.remove()
		return [okBut]
	}
}

customElements.define("msa-utils-popup-message", HTMLMsaUtilsPopupMessageElement)


export function addMessagePopup(parent, dom, kwargs) {
	const popup = addPopup(parent, dom,
		{ "popupTagName":"msa-utils-popup-message" , ...kwargs })
	popup.Q("button.ok").focus()
	return popup
}


export function addErrorPopup(parent, dom, kwargs) {
	return addMessagePopup(parent, dom,
		{ "icon":"/utils/img/error" , ...kwargs })
}


// msa-utils-popup-confirm /////////////////////////////////

export class HTMLMsaUtilsPopupConfirmElement extends HTMLMsaUtilsPopupElement {
	async connectedCallback(){
		await super.connectedCallback()
		this.Q("button.no").focus()
	}
	getButtons(){
		const yesBut = document.createElement("button")
		yesBut.textContent = "Yes"
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
	then(next){
		this.addEventListener("confirm", next)
		return this
	}
}

customElements.define("msa-utils-popup-confirm", HTMLMsaUtilsPopupConfirmElement)


export function addConfirmPopup(parent, dom, kwargs) {
	return addPopup(parent, dom,
		{ "popupTagName":"msa-utils-popup-confirm" , ...kwargs })
}


export async function importAsConfirmPopup(parent, html, kwargs) {
	if(!(html instanceof HTMLElement)){
		html = (await importHtml(html, true))[0]
	}
	return addConfirmPopup(parent, html, kwargs)
}


// msa-utils-popup-input /////////////////////////////////

export class HTMLMsaUtilsPopupInputElement extends HTMLMsaUtilsPopupElement {
	async connectedCallback(){
		await super.connectedCallback()
		this.content.focus()
	}
	getContent(){
		const inputType = this.getAttribute("type") || "text"
		const inputEl = document.createElement("input")
		inputEl.type = inputType
		if(inputType==="text")
			inputEl.onkeydown = evt => {
				if(evt.key === "Enter") this.validate()
			}
		if(this.hasAttribute("value"))
			inputEl.value = this.getAttribute("value")
		return inputEl
	}
	getValue(){
		const input = this.content
		return input.getValue ? input.getValue() : input.value
	}
	getButtons(){
		const okBut = document.createElement("button")
		okBut.textContent = "OK"
		okBut.classList.add("ok")
		okBut.onclick = () => this.validate()
		const cancelBut = document.createElement("button")
		cancelBut.textContent = "Cancel"
		cancelBut.onclick = () => this.cancel()
		return [okBut, cancelBut]
	}
	validate(){
		const val = this.getValue()
		this.dispatchEvent(new CustomEvent("validate", { detail: val }))
		this.remove()
	}
	setValidIf(validIf){
		const okBut = this.Q("button.ok")
		okBut.setAttribute("disabled","true")
		this.content.oninput = () => {
			const valid = validIf(this.getValue())
			if(valid) okBut.removeAttribute("disabled")
			else okBut.setAttribute("disabled","true")
		}
	}
	then(next){
		this.addEventListener("validate", evt => next(evt.detail))
		return this
	}
}

customElements.define("msa-utils-popup-input", HTMLMsaUtilsPopupInputElement)


export function addInputPopup(parent, text, kwargs) {
	const popup = _createPopup(null,
		{ "popupTagName":"msa-utils-popup-input" , ...kwargs })
	if(typeof text === "string")
		popup.getText = () => text
	else
		popup.getContent = () => text
	if(kwargs && kwargs.type)
		popup.setAttribute("type", kwargs.type)
	if(kwargs && kwargs.value != undefined)
		popup.setAttribute("value", kwargs.value)
	if(kwargs && kwargs.input)
		popup.getContent = () => kwargs.input
	parent.appendChild(popup)
	if(kwargs && kwargs.validIf)
		popup.setValidIf(kwargs.validIf)
	return popup
}


export async function importAsInputPopup(parent, html, kwargs) {
	if(!(html instanceof HTMLElement)){
		html = (await importHtml(html, true))[0]
	}
	return addInputPopup(parent, html, kwargs)
}


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
		if(div.childNodes.length === 1)
			return div.childNodes[0]
		else return div
	}
}

function asImg(d){
	if(typeof d === "string" && d.charAt(0) === '/'){
		const img = document.createElement("img")
		img.src = d
		return img
	}
	return asDom(d)
}
