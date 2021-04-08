import { importHtml } from "/msa/utils/msa-utils.js"

// template

const template = `
    <div style="position:relative">
        <div class="suggests" style="position:absolute"></div>
    </div>`

//  style

importHtml(`<style>
    msa-utils-suggest .suggests {
        background: white;
        outline: 1px solid grey;
    }

    msa-utils-suggest .suggest {
        padding: .2em;
        cursor: pointer;
    }

    msa-utils-suggest .suggest:hover, msa-utils-suggest .suggest:focus {
        background: lightgrey;
    }
</style>`)

// msa-utils-suggest

export class MsaUtilsSuggestHTMLElement extends HTMLElement {

    show(){
        this.querySelector(".suggests").style.display = ""
    }

    hide(){
        this.querySelector(".suggests").style.display = "none"
    }

    setTarget(target){
        this.target = target
        target.msaUtilsSuggest = this
    }

    connectedCallback(){
        this.innerHTML = this.getTemplate()
        this.initWidthAndPosition()
        this.initTargetListeners()
        this.hide()
        this.waitAndSuggest()
    }
    
    disconnectedCallback(){
        delete this.target.msaUtilsSuggest
        this.removeTargetListeners()
    }

    getTemplate(){
        return template
    }

    initWidthAndPosition(){
        const suggestsEl = this.querySelector(".suggests")
        const target = this.target
        // reset
        suggestsEl.style.width = 0
        suggestsEl.style.top = 0
        suggestsEl.style.left = 0
        // width
        suggestsEl.style.width = (target.offsetWidth - suggestsEl.offsetWidth) +"px"
        // position
        const suggestsRect = suggestsEl.getBoundingClientRect()
        const targetRect = target.getBoundingClientRect()
        suggestsEl.style.top = (targetRect.top + target.offsetHeight - suggestsRect.top) +"px"
        suggestsEl.style.left = (targetRect.left - suggestsRect.left) +"px"
    }

    addTargetListener(evt, fun){
        this.targetListeners.push([evt,fun])
        this.target.addEventListener(evt, fun)
    }

    removeTargetListeners(){
        this.targetListeners.forEach(l =>
            this.target.removeEventListener(l[0],l[1]))
    }

    initTargetListeners(){
        this.targetListeners = []
        this.addTargetListener("focus", () => this.waitAndSuggest())
        this.addTargetListener("input", () => this.waitAndSuggest())
        this.addTargetListener("blur", () => this.hideIfNotFocused())
    }

    isFocused(){
        const el = document.activeElement
        if(el == this.target) return true
        for(let suggest of this.querySelectorAll(".suggest"))
            if(el == suggest)
                return true
        return false
    }

    getWaitTime(){
        return 500
    }

    waitAndSuggest(){
        const waitTime = this.getWaitTime()
        this.lastEventTime = Date.now()
        setTimeout(async () => {
            if(Date.now() >= this.lastEventTime + waitTime
            && this.isFocused()){
                const suggests = await asPrm(this.getSuggestions(this.target))
                this.showSuggestions(suggests)
            }
        }, waitTime)
    }

    hideIfNotFocused(){
        // we have to wait for next focus to occur
        setTimeout(() => {
            if(!this.isFocused())
                this.hide()
        })
    }

    formatSuggestion(val){
        return val
    }

    fillTarget(target, val){
        target.value = val
    }

    showSuggestions(vals){
        const suggestsEl = this.querySelector(".suggests")
        suggestsEl.innerHTML = ""
        vals.forEach(val => {
            const suggestEl = document.createElement("div")
            suggestEl.classList.add("suggest")
            suggestEl.setAttribute("tabindex","0")
            suggestEl.val = val
            importHtml(this.formatSuggestion(val), suggestEl)
            suggestEl.onclick = () => {
                this.fillTarget(this.target, suggestEl.val)
                this.hide()
            }
            suggestEl.onblur = () => this.hideIfNotFocused()
            suggestsEl.appendChild(suggestEl)
        })
        this.show()
    }
}

customElements.define("msa-utils-suggest", MsaUtilsSuggestHTMLElement)

// makeSuggestions

export function makeSuggestions(target, getSuggestions, kwargs){
    let suggest = target.msaUtilsSuggest
    if(!suggest){
        suggest = document.createElement("msa-utils-suggest")
        suggest.setTarget(target)
        target.parentNode.insertBefore(suggest, target.nextSlibing)
    }
    suggest.getSuggestions = getSuggestions
    if(kwargs && kwargs.waitTime !== undefined)
        suggest.getWaitTime = () => kwargs.waitTime
    if(kwargs && kwargs.formatSuggestion)
        suggest.formatSuggestion = kwargs.formatSuggestion
    if(kwargs && kwargs.fillTarget)
        suggest.fillTarget = kwargs.fillTarget
    return suggest
}

// utils

function isPrm(p){
    return (typeof p === "object") && (p.then !== undefined)
}

function asPrm(p){
    return isPrm(p) ? p : new Promise((ok,ko)=>ok(p))
}