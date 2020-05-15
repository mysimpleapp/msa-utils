import { importHtml, getMsaBoxInfos } from "/utils/msa-utils.js"

importHtml(`<style>
	msa-utils-boxes-menu .button {
		display: inline-block;
		width: 100px;
		height: 100px;
		margin: 10px;
		text-align: center;
		vertical-align: middle;
		border: 1px solid #aaa;
		border-radius: 10px;
		cursor: pointer;
	}
	msa-utils-boxes-menu .button:hover {
		box-shadow: 2px 2px 5px 2px #aaa;
	}
	msa-utils-boxes-menu .img {
		padding: 10px 0px 5px 20px;
		width: 60px;
		height: 60px;
	}
	msa-utils-boxes-menu .img img {
		max-width: 60px;
		max-height: 60px;
	}
</style>`)


export class HTMLMsaUtilsBoxesMenuElement extends HTMLElement {

	connectedCallback() {
		this.renderBoxes()
	}

	async renderBoxes() {
		const boxInfos = await getMsaBoxInfos()
		for (let k in boxInfos) {
			const but = this.newBoxButton(boxInfos[k])
			this.appendChild(but)
		}
	}

	newBoxButton(box) {
		const but = document.createElement("span")
		but.classList.add("button")
		but.innerHTML = "<div class='img'>" + box.img + "</div>"
		but.innerHTML += "<div class='title'>" + box.title + "</div>"
		but.box = box
		but.addEventListener("click", () => this.onSelect(box))
		return but
	}
}

customElements.define("msa-utils-boxes-menu", HTMLMsaUtilsBoxesMenuElement)