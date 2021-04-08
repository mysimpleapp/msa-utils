import { importHtml, fetchMsaBoxInfos } from "/msa/utils/msa-utils.js"

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
		const boxInfos = await fetchMsaBoxInfos()
		for (let tag in boxInfos) {
			const but = this.newBoxButton(tag, boxInfos[tag])
			this.appendChild(but)
		}
	}

	newBoxButton(tag, boxInfo) {
		const but = document.createElement("span")
		but.classList.add("button")
		but.innerHTML = "<div class='img'>" + boxInfo.img + "</div>"
		but.innerHTML += "<div class='title'>" + boxInfo.title + "</div>"
		but.boxInfo = boxInfo
		but.addEventListener("click", () => this.onSelect(tag, boxInfo))
		return but
	}
}

customElements.define("msa-utils-boxes-menu", HTMLMsaUtilsBoxesMenuElement)