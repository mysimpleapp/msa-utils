export function setPositionRelativeTo(el, targetEl, posX, posY, kwargs) {
	const compStyle = (kwargs && kwargs.targetComputedStyle) || window.getComputedStyle(targetEl)
	const targetPosition = compStyle.position
    const relativeToTarget = (targetPosition=="absolute" || targetPosition=="relative")
    const elStyle = el.style
    const dx = getArg(kwargs, "dx", el.offsetWidth / 2)
    const dy = getArg(kwargs, "dy", el.offsetHeight / 2)
	// if target has relative or absolute pos: use this to set handles positions (as this is less buggy than other solution)
	if(relativeToTarget) {
        // left / right
        if(posX=="left") elStyle.left = `-${dx}px`
        else if(posX=="center") elStyle.left = `calc(50% - ${dx}px)`
        else if(posX=="right") elStyle.right = `-${dx}px`
        // top / bottom
        if(posY=="top") elStyle.top = `-${dy}px`
        else if(posY=="center") elStyle.top = `calc(50% - ${dy}px)`
        else if(posY=="bottom") elStyle.bottom = `-${dy}px`
	// else: set handle positions using offsets
	} else {
		const targetLeft = targetEl.offsetLeft
		const targetTop = targetEl.offsetTop
		const targetWidth = targetEl.offsetWidth
		const targetHeight = targetEl.offsetHeight
        // left / right
        if(posX=="left") elStyle.left = (targetLeft - dx) +"px"
        else if(posX=="center") elStyle.left = (targetLeft + targetWidth/2 - dx) +"px"
        else if(posX=="right") elStyle.left = (targetLeft + targetWidth - dx) +"px"
        // top / bottom
        if(posY=="top") elStyle.top = (targetTop - dy) +"px"
        else if(posY=="center") elStyle.top = (targetTop + targetHeight/2 - dy) +"px"
        else if(posY=="bottom") elStyle.top = (targetTop + targetHeight - dy) +"px"
	}
}

// utils

function getArg(kwargs, key, defVal) {
    const val = kwargs && kwargs[key]
    return (val===undefined) ? defVal : val
}