import { importHtml, importOnCall, createMsaBox, initMsaBox, exportMsaBox, editMsaBox, forEachDeepMsaBox } from "/utils/msa-utils.js"

const addPopup = importOnCall("/utils/msa-utils-popup.js", "addPopup")
const setPositionRelativeTo = importOnCall("/utils/msa-utils-position.js", "setPositionRelativeTo")

importHtml(`<style>
	.msa-utils-box-editable {
        outline: 1px dashed lightgrey;
    }

    .msa-utils-box-editable:hover, 
    .msa-utils-box-editing {
        box-shadow: 2px 2px 10px grey;
    }
    
    .msa-utils-box-first-add-btn {
        display: block;
        height: 3em;
        background: white;
        background-image: url('/utils/img/add');
        background-size: 1.5em;
        background-repeat: no-repeat;
        background-position: center;
        border: 2px dashed black;
        border-radius: .5em;
        cursor: pointer;
    }
    
    .msa-utils-box-add-btn {
        display: block;
        position: absolute;
        width: 2em;
        height: 2em;
        background: white;
        background-image: url('/utils/img/add');
        background-size: 80%;
        background-repeat: no-repeat;
        background-position: center;
        box-shadow: 1px 1px 5px grey;
        border-radius: .5em;
        cursor: pointer;
    }
    .msa-utils-box-add-btn:hover {
        box-shadow: 1px 1px 5px black;
    }
</style>`)

export async function editMsaBoxes(el, boxCtx) {
    await _makeBoxEditable(el, el, boxCtx)
    _initFirstAddButtons(el, boxCtx)
}

async function _makeBoxEditable(el, initEl, boxCtx) {
    await forEachDeepMsaBox(initEl, async box => {
        box.msaBoxContentBeforeEdition = (await exportMsaBoxes(box)).innerHTML
        box.classList.add("msa-utils-box-editable")
        box.setAttribute("tabindex", 0)
        box.addEventListener("focus", () => _editMsaBox(el, box))
        box.addEventListener("focusout", evt => {
            if(!box.contains(evt.relatedTarget))
                _stopEditMsaBox(el, box)
        })
        box.addEventListener("mouseenter", () => _addBoxAddButtons(el, box, boxCtx))
        box.addEventListener("mouseleave", () => _rmBoxAddButtons(el, box, boxCtx))
    })
}

async function _editMsaBox(el, box) {
    if (box === el.msaUtilsEditingBox) return
    if (el.msaUtilsEditingBox) _stopEditMsaBox(el.msaUtilsEditingBox)
    el.msaUtilsEditingBox = box
    box.classList.add("msa-utils-box-editing")
    await editMsaBox(box, true)
}

async function _stopEditMsaBox(el, box) {
    if (box !== el.msaUtilsEditingBox) return
    delete el.msaUtilsEditingBox
    box.classList.remove("msa-utils-box-editing")
    await editMsaBox(box, false)
    const content = (await exportMsaBoxes(box)).innerHTML
    if (content != box.msaBoxContentBeforeEdition){
        el.dispatchEvent(new Event("msa-box-edited", {
            detail: { box }
        }))
    }
    box.msaBoxContentBeforeEdition = content
}

function _addBoxAddButtons(el, box, boxCtx) {
    const line = box.parentNode
    const addBtn = (posX, posY, onNewBox) => {
        const btn = document.createElement("button")
        btn.classList.add("msa-utils-box-add-btn", "msa-utils-box-editor")
        setPositionRelativeTo(btn, box, posX, posY)
        box.appendChild(btn)
        _initAddButton(el, btn, boxCtx, onNewBox)
    }
    addBtn("left", "center", newBoxEl => insertBefore(newBoxEl, box))
    addBtn("right", "center", newBoxEl => insertAfter(newBoxEl, box))
    addBtn("center", "top", newBoxEl => insertBefore(_createLine(newBoxEl), line))
    addBtn("center", "bottom", newBoxEl => insertAfter(_createLine(newBoxEl), line))
}

function _rmBoxAddButtons(box) {
    box.querySelectorAll(".msa-utils-box-add-btn").forEach(b => b.remove())
}

function _initFirstAddButtons(el, boxCtx) {
    if(el.children.length > 0) return
    const btnEl = document.createElement("div")
    btnEl.classList.add("msa-utils-box-first-add-btn", "msa-utils-box-editor")
    _initAddButton(el, btnEl, boxCtx, newBoxEl => {
        insertBefore(_createLine(newBoxEl), btnEl)
        btnEl.remove()
    })
    el.appendChild(btnEl)
}

function _initAddButton(el, addBtn, boxCtx, insertBoxFn) {
    addBtn.onclick = async () => {
        await import("/utils/msa-utils-boxes-menu.js")
        const popup = await addPopup(el, document.createElement("msa-utils-boxes-menu"))
        popup.content.onSelect = async tag => {
            popup.remove()
            const boxCtx2 = Object.assign({ parent: el }, boxCtx)
            const box = await createMsaBox(tag, boxCtx2)
            box.style.margin = ".5em"
            box.style.padding = ".5em"
            await initMsaBox(box, boxCtx2)
            await _makeBoxEditable(el, box)
            insertBoxFn(box)
            el.dispatchEvent(new Event("msa-box-inserted", {
                detail: { box }
            }))
        }
    }
}

function _createLine(box) {
    const lineEl = document.createElement("div")
    lineEl.style.display = "flex"
    lineEl.style.flexDirection = "row"
    lineEl.appendChild(box)
    return lineEl
}

export async function exportMsaBoxes(el) {
    const tmpl = await exportMsaBox(el)
    for (let ed of tmpl.content.querySelectorAll(".msa-utils-box-editor"))
        ed.remove()
    for (let box of tmpl.content.querySelectorAll(".msa-utils-box-editable")) {
        box.classList.remove("msa-utils-box-editable")
        box.removeAttribute("tabindex")
    }
    return tmpl
}

// utils

function insertBefore(newNode, refNode) {
    refNode.parentNode.insertBefore(newNode, refNode)
}

function insertAfter(newNode, refNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling)
}