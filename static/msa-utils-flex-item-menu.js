import { importHtml, Q } from "/msa/msa.js"
import { isSize, getSizeVal, getSizeUnit, trigger, backup, restore } from "/utils/msa-utils-common.js"
import { addPopup } from "/utils/msa-utils-popup.js"

// SVGs
importHtml(`<svg id="msa-utils-flex-item-menu-svg" style="display:none">
	<!-- width full -->
	<symbol id="msa-utils-flex-item-menu-width-full" viewBox="0 0 100 100" fill="none" stroke="#999" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
		<rect x="4" y="4" width="92" height="100" />
		<rect x="14" y="27" width="72" height="46" />
		<path fill="#999" stroke="none" d="m20 50l20 -13l0 26" />
		<path fill="#999" stroke="none" d="m80 50l-20 -13l0 26" />
	</symbol>
	<!-- width just -->
	<symbol id="msa-utils-flex-item-menu-width-just" viewBox="0 0 100 100" fill="none" stroke="#999" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
		<rect x="22" y="25" width="56" height="50" />
		<path fill="#999" stroke="none" d="m15 50l-15 -15l0 30" />
		<path fill="#999" stroke="none" d="m85 50l15 -15l0 30" />
		<line stroke-width="5" x1="34" y1="38" x2="66" y2="38" />
		<line stroke-width="5" x1="34" y1="50" x2="66" y2="50" />
		<line stroke-width="5" x1="34" y1="62" x2="50" y2="62" />
	</symbol>
	<!-- width fixed -->
	<symbol id="msa-utils-flex-item-menu-width-fixed" viewBox="0 0 100 100" fill="none" stroke="#999" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
		<rect x="11" y="25" width="78" height="50" />
		<rect stroke-width="6" stroke-linejoin="miter" fill="white" x="3" y="42" width="16" height="16" />
		<rect stroke-width="6" stroke-linejoin="miter" fill="white" x="81" y="42" width="16" height="16" />
		<path fill="#999" stroke="none" d="m25 50l20 -13l0 26" />
		<path fill="#999" stroke="none" d="m75 50l-20 -13l0 26" />
	</symbol>
	<!-- row left -->
	<symbol id="msa-utils-flex-item-menu-row-left" viewBox="0 0 100 100" fill="none" stroke="#999" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
		<rect x="4" y="4" width="40" height="23" />
		<rect x="4" y="37" width="92" height="23" />
		<rect x="4" y="70" width="60" height="23" />
	</symbol>
	<!-- row center -->
	<symbol id="msa-utils-flex-item-menu-row-center" viewBox="0 0 100 100" fill="none" stroke="#999" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
		<rect x="30" y="4" width="40" height="23" />
		<rect x="4" y="37" width="92" height="23" />
		<rect x="20" y="70" width="60" height="23" />
	</symbol>
	<!-- row right -->
	<symbol id="msa-utils-flex-item-menu-row-right" viewBox="0 0 100 100" fill="none" stroke="#999" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
		<rect x="56" y="4" width="40" height="23" />
		<rect x="4" y="37" width="92" height="23" />
		<rect x="36" y="70" width="60" height="23" />
	</symbol>
	<!-- row inline -->
	<symbol id="msa-utils-flex-item-menu-row-inline" viewBox="0 0 100 100" fill="none" stroke="#999" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
		<rect x="5" y="4" width="90" height="30" />
		<rect x="5" y="44" width="90" height="30" stroke-dasharray="3,12" />
	</symbol>
	<!-- row float -->
	<symbol id="msa-utils-flex-item-menu-row-float" viewBox="0 0 100 100" fill="none" stroke="#999" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
		<rect x="20" y="25" width="50" height="35" />
		<path stroke-dasharray="3,12" d="m20 35h-15v-30h90v30h-25" />
	</symbol>
	<!-- height full -->
	<symbol id="msa-utils-flex-item-menu-height-full" viewBox="0 0 100 100">
		<use xlink:href="#msa-utils-flex-item-menu-width-full" transform="matrix(0 1 1 0 0 0)"></use>
	</symbol>
	<!-- height just -->
	<symbol id="msa-utils-flex-item-menu-height-just" viewBox="0 0 100 100" fill="none" stroke="#999" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
		<rect x="25" y="22" width="50" height="56" />
		<path fill="#999" stroke="none" d="m50 15l-15 -15l30 0" />
		<path fill="#999" stroke="none" d="m50 85l-15 15l30 0" />
		<line stroke-width="5" x1="38" y1="38" x2="62" y2="38" />
		<line stroke-width="5" x1="38" y1="50" x2="62" y2="50" />
		<line stroke-width="5" x1="38" y1="62" x2="50" y2="62" />
	</symbol>
	<!-- height fixed -->
	<symbol id="msa-utils-flex-item-menu-height-fixed" viewBox="0 0 100 100">
		<use xlink:href="#msa-utils-flex-item-menu-width-fixed" transform="matrix(0 1 1 0 0 0)"></use>
	</symbol>
	<!-- column top -->
	<symbol id="msa-utils-flex-item-menu-column-top" viewBox="0 0 100 100">
		<use xlink:href="#msa-utils-flex-item-menu-row-left" transform="matrix(0 1 1 0 0 0)"></use>
	</symbol>
	<!-- column center -->
	<symbol id="msa-utils-flex-item-menu-column-center" viewBox="0 0 100 100">
		<use xlink:href="#msa-utils-flex-item-menu-row-center" transform="matrix(0 1 1 0 0 0)"></use>
	</symbol>
	<!-- column bottom -->
	<symbol id="msa-utils-flex-item-menu-column-bottom" viewBox="0 0 100 100">
		<use xlink:href="#msa-utils-flex-item-menu-row-right" transform="matrix(0 1 1 0 0 0)"></use>
	</symbol>
	<!-- column inline -->
	<symbol id="msa-utils-flex-item-menu-column-inline" viewBox="0 0 100 100">
		<use xlink:href="#msa-utils-flex-item-menu-row-inline" transform="matrix(0 1 1 0 0 0)"></use>
	</symbol>
	<!-- column float -->
	<symbol id="msa-utils-flex-item-menu-column-float" viewBox="0 0 100 100">
		<use xlink:href="#msa-utils-flex-item-menu-row-float" transform="matrix(0 1 1 0 0 0)"></use>
	</symbol>
</svg>`, document.body)

// style
importHtml(`<style>
	msa-utils-flex-item-menu div.block {
		margin-bottom: 15px;
	}
	msa-utils-flex-item-menu div.title {
		font-size: 20px;
		font-style: italic;
		border-bottom: 1px solid black;
		margin-bottom: 10px;
	}
	msa-utils-flex-item-menu .line {
		text-align: center;
	}
	msa-utils-flex-item-menu .icon {
		display: inline-flex;
		flex-direction: column;
	}
	msa-utils-flex-item-menu .icon svg {
		width: 40px;
		height: 40px;
		box-shadow: 1pt 1pt 2pt 1pt #aaa;
		border-radius: 5px;
		padding: 5px;
		margin: 5px;
		cursor: pointer;
	}
	msa-utils-flex-item-menu .icon.highlight svg {
		background: #d3ebf0;
	}
	msa-utils-flex-item-menu .icon svg:hover {
		background: #eee;
	}
	msa-utils-flex-item-menu .icon label {
		font-size: 14px;
		font-weight: bold;
	}
	msa-utils-flex-item-menu .value {
		padding: 2px;
	}
	msa-utils-flex-item-menu .value input {
		text-align: right;
		width: 60px;
	}
</style>`)

// template

const template = `
	<!-- block position -->
	<div class="block position">
		<div class="title">Position</div>
		<!-- row position icons -->
		<div class="line row-position">
			<span class="icon row-inline">
				<svg><use xlink:href="#msa-utils-flex-item-menu-row-inline"></use></svg>
				<label>inline</label>
			</span>
			<span class="icon row-float">
				<svg><use xlink:href="#msa-utils-flex-item-menu-row-float"></use></svg>
				<label>floating</label>
			</span>
		</div>
		<!-- column position icons -->
		<div class="line column-position">
			<span class="icon column-inline">
				<svg><use xlink:href="#msa-utils-flex-item-menu-column-inline"></use></svg>
				<label>inline</label>
			</span>
			<span class="icon column-float">
				<svg><use xlink:href="#msa-utils-flex-item-menu-column-float"></use></svg>
				<label>floating</label>
			</span>
		</div>
		<!-- position values -->
		<div class="line position-values" style="padding-top: 10px;">
			<!-- position x value -->
			<div class="value position-x-value">
				<input class="val" type="number" min="0" step="10">
				<select class="unit">
					<option>px</option>
					<option>%</option>
				</select>
				from
				<select class="attr" style="width:70px">
					<option>left</option>
					<option>right</option>
				</select>
			</div>
			<!-- position y value -->
			<div class="value position-y-value">
				<input class="val" type="number" min="0" step="10">
				<select class="unit">
					<option>px</option>
					<option>%</option>
				</select>
				from
				<select class="attr" style="width:70px">
					<option>top</option>
					<option>bottom</option>
				</select>
			</div>
		</div>
	</div>
	<!-- block width -->
	<div class="block width">
		<div class="title">Width</div>
		<div class="line width">
			<span class="icon width-full">
				<svg><use xlink:href="#msa-utils-flex-item-menu-width-full"></use></svg>
				<label>full</label>
			</span>
			<span class="icon width-just">
				<svg><use xlink:href="#msa-utils-flex-item-menu-width-just"></use></svg>
				<label>just</label>
			</span>
			<span class="icon width-fixed">
				<svg><use xlink:href="#msa-utils-flex-item-menu-width-fixed"></use></svg>
				<label>fixed</label>
			</span>
		</div>
		<!-- width value -->
		<div class="line value width-value" style="padding-top: 10px;">
			<input class="val" type="number" min="0" step="10">
			<select class="unit">
				<option>px</option>
				<option>%</option>
			</select>
		</div>
	</div>
	<!-- block height -->
	<div class="block height">
		<div class="title">Height</div>
		<div class="line height">
			<span class="icon height-full">
				<svg><use xlink:href="#msa-utils-flex-item-menu-height-full"></use></svg>
				<label>full</label>
			</span>
			<span class="icon height-just">
				<svg><use xlink:href="#msa-utils-flex-item-menu-height-just"></use></svg>
				<label>just</label>
			</span>
			<span class="icon height-fixed">
				<svg><use xlink:href="#msa-utils-flex-item-menu-height-fixed"></use></svg>
				<label>fixed</label>
			</span>
		</div>
		<!-- height value -->
		<div class="line value height-value" style="padding-top: 10px;">
			<input class="val" type="number" min="0" step="10">
			<select class="unit">
				<option>px</option>
				<option>%</option>
			</select>
		</div>
	</div>
	<!-- block align -->
	<div class="block align">
		<div class="title">Align</div>
		<div class="line row-align">
			<span class="icon row-start">
				<svg><use xlink:href="#msa-utils-flex-item-menu-row-left"></use></svg>
				<label>left</label>
			</span>
			<span class="icon row-center">
				<svg><use xlink:href="#msa-utils-flex-item-menu-row-center"></use></svg>
				<label>center</label>
			</span>
			<span class="icon row-end">
				<svg><use xlink:href="#msa-utils-flex-item-menu-row-right"></use></svg>
				<label>right</label>
			</span>
		</div>
		<div class="line column-align">
			<span class="icon column-start">
				<svg><use xlink:href="#msa-utils-flex-item-menu-column-top"></use></svg>
				<label>top</label>
			</span>
			<span class="icon column-center">
				<svg><use xlink:href="#msa-utils-flex-item-menu-column-center"></use></svg>
				<label>center</label>
			</span>
			<span class="icon column-end">
				<svg><use xlink:href="#msa-utils-flex-item-menu-column-bottom"></use></svg>
				<label>bottom</label>
			</span>
		</div>
	</div>`


// msa-utils-flex-item-menu //////////////////////////////////////

export class HTMLMsaUtilsFlexItemMenuElement extends HTMLElement {

	connectedCallback(){
		this.Q = Q
		this.innerHTML = this.getTemplate()
		this.initActions()
	}

	disconnectedCallback() {
		this.unlink()
	}

	getTemplate() {
		return template
	}

	linkTo(target) {
		if(this.target) this.unlink()
		this.target = target
		target.msaUtilsFlexItemMenu = this
		target.addEventListener("select", showMenu)
		target.addEventListener("deselect", hideMenu)
		target.addEventListener("move", syncMenuFromMove)
		target.addEventListener("resize", syncMenuFromResize)
		this.sync()
		this.backupStyle()
	}

	unlink() {
		if(!this.target) return
		var target = this.target
		target.removeEventListener("select", showMenu)
		target.removeEventListener("deselect", hideMenu)
		target.removeEventListener("move", syncMenuFromMove)
		target.removeEventListener("resize", syncMenuFromResize)
		delete target.msaUtilsFlexItemMenu
		delete this.target
	}

	showMenu() {
		var menu = this.msaUtilsFlexItemMenu
		if(menu) menu.style.display = ''
	}

	hideMenu() {
		var menu = this.msaUtilsFlexItemMenu
		if(menu) menu.style.display = 'none'
	}

	syncMenuFromMove() {
		var menu = this.msaUtilsFlexItemMenu
		if(menu) menu.sync("move")
	}

	syncMenuFromResize() {
		var menu = this.msaUtilsFlexItemMenu
		if(menu) menu.sync("resize")
	}

	backupStyle() {
		if(this.styleBackup!==undefined || !this.target) return
		this.styleBackup = this.target.style.cssText
	}

	restoreStyle() {
		if(this.styleBackup===undefined || !this.target) return
		this.target.style.cssText = this.styleBackup
		delete this.styleBackup
	}

	show() {
		this.style.display = ''
	}

	hide() {
		this.style.display = 'none'
	}

	trigger(evt) {
		trigger(this.target, evt)
	}

	sync(changeType) {
		var target = this.target, style = target.style
		var computedStyle = window.getComputedStyle(target)

		if(!changeType) {
			var parentComputedStyle = window.getComputedStyle(target.parentNode)
			this.direction = (parentComputedStyle.flexDirection=="row") ? "column" : "row"
		}

		// position
		if(!changeType || changeType=="move") {
			var dir = this.direction
			var pos = (computedStyle.position=="absolute") ? "float" : "inline"
			var posUpdated = update(this, "position", pos)
			// show correct lines
			this.showIf(".line.row-position", dir=="row")
			this.showIf(".line.column-position", dir=="column")
			// highlight correct icon
			this.highlight(".icon."+dir+"-"+pos, ".line."+dir+"-position")
			// sync position values
			var showPosValues = (pos=="float")
			this.showIf(".line.position-values", showPosValues)
			if(showPosValues) {
				this.syncValue("position-x-value", ".position-x-value", computedStyle)
				this.syncValue("position-y-value", ".position-y-value", computedStyle)
			}
		}

		// size
		if(!changeType || changeType=="resize" || posUpdated) {
			var dir = this.direction
			var dirSizeKey = (dir=="row") ? "width" : "height"
			var otherSizeKey = (dir=="row") ? "height" : "width"
			var pos = this.position

			// determine dirSize
			var align = computedStyle.alignSelf, fixedDirSize = style[dirSizeKey]
			if(fixedDirSize) var dirSize = "fixed"
			else if(pos=="inline" && align=="stretch") var dirSize = "full"
			else var dirSize = "just"
			var dirSizeUpdated = update(this, dirSizeKey, dirSize)
			// hide full icon if position is float
			this.showIf(".icon."+dirSizeKey+"-full", pos=="inline")
			// highlight correct icon
			this.highlight(".icon."+dirSizeKey+"-"+dirSize, ".line."+dirSizeKey)
			// sync pos
			var showDirSizeValue = (dirSize=="fixed")
			this.showIf(".line."+dirSizeKey+"-value", showDirSizeValue)
			if(showDirSizeValue)
				this.syncValue(dirSizeKey+"-value", "."+dirSizeKey+"-value", computedStyle, dirSizeKey)

			// determine otherSize
			var flexGrow = computedStyle.flexGrow, fixedOtherSize = style[otherSizeKey]
			if(flexGrow!="0") var otherSize = "full"
			else if(fixedOtherSize) var otherSize = "fixed"
			else var otherSize = "just"
			var otherSizeUpdated = update(this, otherSizeKey, otherSize)
			// hide full icon if position is float
			this.showIf(".icon."+otherSizeKey+"-full", pos=="inline")
			// highlight correct icon
			this.highlight(".icon."+otherSizeKey+"-"+otherSize, ".line."+otherSizeKey)
			// sync pos
			var showOtherSizeValue = (otherSize=="fixed")
			this.showIf(".line."+otherSizeKey+"-value", otherSize=="fixed")
			if(showOtherSizeValue)
				this.syncValue(otherSizeKey+"-value", "."+otherSizeKey+"-value", computedStyle, otherSizeKey)
		}

		// align
		if(!changeType || changeType=="move" || posUpdated || dirSizeUpdated) {
			var dir = this.direction
			// determine align
			var targetAlign = computedStyle.alignSelf
			if(targetAlign=="center") var align = "center"
			else if(targetAlign=="flex-end") var align = "end"
			else var align = "start"
			this.align = align
			// show align block, if needed
			var pos = this.position
			var dirSizeKey = (dir=="row") ? "width" : "height"
			var dirSize = this[dirSizeKey]
			var showAlign = (pos!="float" && dirSize!="full")
			this.showIf(".block.align", showAlign)
			if(!showAlign) return
			// show correct line
			this.showIf(".line.row-align", dir=="row")
			this.showIf(".line.column-align", dir=="column")
			// highlight correct icon
			this.highlight(".icon."+dir+"-"+align, ".line."+dir+"-align")
		}
	}

	showIf(query, doShow) {
		var dom = this.Q(query)
		if(dom) dom.style.display = doShow ? "" : "none"
	}

	highlight(queryToHighlight, queryToUnhighlight) {
		// remove all highlights in input block (if exists)
		if(queryToUnhighlight) {
			var dom = this.Q(queryToUnhighlight)
			if(dom) {
				var highlights = dom.querySelectorAll(".highlight")
				for(var i=0, len=highlights.length; i<len; ++i)
					highlights[i].classList.remove("highlight")
			}
		}
		// add highlight to input elem (if exists)
		if(queryToHighlight) {
			var dom = this.Q(queryToHighlight)
			if(dom) dom.classList.add("highlight")
		}
	}

	syncValue(type, query, computedStyle, attr) {
		var target = this.target, dom = this.Q(query)
		var computedStyle = window.getComputedStyle(target)
		var valueObj = this[type] = this[type] || {}
		// determine attr (if not provided)
		if(!attr) {
			var attrSelect = this.Q(query+" .attr")
			attr = attrSelect.options[attrSelect.selectedIndex].text
		}
		valueObj.attr = attr
		// get size
		var size = target.style[attr] || computedStyle[getAssociatedComputedStyleAttr(attr)]
		if(!isSize(size)) size = "0px"
		var val = getSizeVal(size), unit = getSizeUnit(size)
		// sync val input
		valueObj.val = val
		this.Q(query+" .val").value = val
		// sync unit select
		valueObj.unit = unit
		var unitSelect = this.Q(query+" .unit")
		unitSelect.selectedIndex = getOptionIndexFromText(unitSelect, unit)
	}

	initActions() {

		this.Q(".icon.row-inline").onclick = this.Q(".icon.column-inline").onclick = () => {
			setPositionInline(this.target)
		}
		this.Q(".icon.row-float").onclick = this.Q(".icon.column-float").onclick = () => {
			setPositionFloat(this.target)
		}

		// size

		const buildSetSizeFull = (size, dir, otherDir) => {
			return () => {
				var menu=this, target=menu.target
				var direction = menu.direction
				// update target style
				if(direction==dir)
					target.style.alignSelf = "stretch"
				else if(direction==otherDir)
					target.style.flex = "1"
				target.style[size] = ""
				// trigger change
				menu.trigger("resize")
			}
		}
		this.Q(".icon.width-full").onclick = buildSetSizeFull("width", "row", "column")
		this.Q(".icon.height-full").onclick = buildSetSizeFull("height", "column", "row")

		const buildSetSizeJust = (size, dir, otherDir) => {
			return () => {
				var menu=this, target=menu.target
				var direction = menu.direction
				// update target style
				if(direction==dir && (!target.style.alignSelf || target.style.alignSelf=="stretch"))
					target.style.alignSelf = "flex-start"
				else if(direction==otherDir)
					target.style.flex = "0"
				target.style[size] = ""
				// trigger change
				menu.trigger("resize")
			}
		}
		this.Q(".icon.width-just").onclick = buildSetSizeJust("width", "row", "column")
		this.Q(".icon.height-just").onclick = buildSetSizeJust("height", "column", "row")

		// TODO: fix buildSetSizeFixed (harmonize code in msa-utils-common-size ?)
		const buildSetSizeFixed = (size, dir, otherDir) => {
			return () => {
				var menu=this, target=menu.target
				var computedStyle = window.getComputedStyle(target)
				var direction = menu.direction
				// update target style
				if(direction==dir && (!target.style.alignSelf || target.style.alignSelf=="stretch"))
					target.style.alignSelf = "flex-start"
				else if(direction==otherDir)
					target.style.flex = "0"
				if(!target.style[size])
					target.style[size] = computedStyle[size]
				// trigger change
				menu.trigger("resize")
			}
		}
		this.Q(".icon.width-fixed").onclick = buildSetSizeFixed("width", "row", "column")
		this.Q(".icon.height-fixed").onclick = buildSetSizeFixed("height", "column", "row")

		// align

		this.Q(".icon.row-start").onclick = this.Q(".icon.column-start").onclick = () => {
			var menu=this, target=menu.target
			target.style.alignSelf = "flex-start"
			// trigger change
			menu.trigger("move")
		}

		this.Q(".icon.row-center").onclick = this.Q(".icon.column-center").onclick = () => {
			var menu=this, target=menu.target
			target.style.alignSelf = "center"
			// trigger change
			menu.trigger("move")
		}

		this.Q(".icon.row-end").onclick = this.Q(".icon.column-end").onclick = () => {
			var menu=this, target=menu.target
			target.style.alignSelf = "flex-end"
			// trigger change
			menu.trigger("move")
		}

		// unit

		const buildSetSizeVal = (type, changeType) => {
			return (evt, input) => {
				var menu = this, target = menu.target
				// update target style
				var attr = menu[type].attr,
					val = input.value,
					unit = menu[type].unit
				target.style[attr] = val + unit
				// trigger change
				menu.trigger(changeType)
			}
		}
		this.Q(".position-x-value .val").oninput = buildSetSizeVal("position-x-value", "move")
		this.Q(".position-y-value .val").oninput = buildSetSizeVal("position-y-value", "move")
		this.Q(".width-value .val").oninput = buildSetSizeVal("width-value", "resize")
		this.Q(".height-value .val").oninput = buildSetSizeVal("height-value", "resize")

		const buildSetSizeUnit = (type, changeType) => {
			return (evt, input) => {
				var menu = this, target = menu.target
				var computedStyle = window.getComputedStyle(target)
				var attr = menu[type].attr, computedAttr = getAssociatedComputedStyleAttr(attr)
				// save old size value
				var oldValue = getSizeVal(computedStyle[computedAttr])
				// update target style
				var val = menu[type].val,
					unit = input.options[input.selectedIndex].text
				target.style[attr] = val + unit
				// recompute the size with the new unit, like if it would have not changed
				var newValue = getSizeVal(computedStyle[computedAttr])
				var recomputedVal = Math.floor(val * oldValue / newValue)
				// re-update target style, with recomputed size
				target.style[attr] = recomputedVal + unit
				// trigger change
				menu.trigger(changeType)
			}
		}
		this.Q(".position-x-value .unit").oninput = buildSetSizeUnit("position-x-value", "move")
		this.Q(".position-y-value .unit").oninput = buildSetSizeUnit("position-y-value", "move")
		this.Q(".width-value .unit").oninput = buildSetSizeUnit("width-value", "resize")
		this.Q(".height-value .unit").oninput = buildSetSizeUnit("height-value", "resize")

		const buildSetSizeAttr = (type, changeType) => {
			return (evt, input) => {
				var menu = this, target = menu.target
				// update target style, by removing previous attr style
				var oldAttr = menu[type].attr
				target.style[oldAttr] = ""
				// update target style, by setting the new attr style
				var attr = input.options[input.selectedIndex].text,
					val = menu[type].val,
					unit = menu[type].unit
				target.style[attr] = val + unit
				// trigger change
				menu.trigger(changeType)
			}
		}
		this.Q(".position-x-value .attr").oninput = buildSetSizeAttr("position-x-value", "move")
		this.Q(".position-y-value .attr").oninput = buildSetSizeAttr("position-y-value", "move")
	}
}

customElements.define("msa-utils-flex-item-menu", HTMLMsaUtilsFlexItemMenuElement)


// position
export function setPositionInline(target) {
	var computedStyle = window.getComputedStyle(target)
	// check if position is already different from "absolute"
	if(computedStyle.position != "absolute" ) return
	// reset style position & check if it is enough to be != "absolute"
	target.style.position = ""
	computedStyle = window.getComputedStyle(target)
	// else force position to "static"
	if(computedStyle.position == "absolute" ) target.style.position = "static"
	// remove top, bottom, width, height (as they may be created by absolute positioning, and may interfer with relative position)
	backup(target, { key:"msaUtilsPosition", style:["left", "right", "top", "bottom"] })
	trigger(target, "move")
}

export function setPositionFloat(target) {
	// update target position
	target.style.position = "absolute"
	// set top & left, if necessary
	var compStyle = window.getComputedStyle(target)

	restore(target, { key: "msaUtilsPosition" })

	xSize = target.style.left || target.style.right || compStyle.left
	if(!isSize(xSize)) target.style.left = "0px"

	ySize = target.style.top || target.style.bottom || compStyle.top
	if(!isSize(ySize)) target.style.top = "0px"
	trigger(target, "move")
}

// popup ///////////////////////////////////

export function popupFlexItemMenuFor(target) {
	if(typeof target==="string")
		target = document.querySelector(target)
	var menu = target.msaUtilsFlexItemMenu
	if(!menu) {
		menu = addPopup(target, "msa-utils-flex-item-menu", {
			buttons: [
				{ text:"OK", fun:function(){ this.remove() } },
				{ text:"Cancel", fun:function(){ this.cancel() } }
			]
		})
		menu.addEventListener("cancel", () => this.restoreStyle())
		menu.linkTo(target)
	}
	return menu
}


// utils /////////////////////////////////

function update(obj, key, val) {
	var oldVal = obj[key]
	var updated = (oldVal!==val)
	if(updated) obj[key] = val
	return updated
}
function getOptionIndexFromText(selectDom, optionText) {
	var res = null
	var options = selectDom.options
	for(var i=0, len=options.length; i<len; ++i) {
		var option = options[i]
		if(option.text==optionText)
			res = i
	}
	return res
}

// style attrs
function getAssociatedComputedStyleAttr(attr) {
	if(attr==="minHeight") attr = "height"
	return attr
}