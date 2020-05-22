const { formatHtml } = require('./htmlExpr')

const MsaBoxes = {}
const MsaBoxesRouter = Msa.express.Router()
const registerMsaBox = function (tag, kwargs) {
    const box = Object.assign({}, kwargs)
    box.tag = tag
    if (box.html)
        box.html = formatHtml(box.html)
    if (!box.title) box.title = tag
    // default args
    if (!box.img) box.img = defaultImg
    // insert in global map
    MsaBoxes[tag] = box
    // add template module in router (if any)
    if (box.mods) for (let route in box.mods) {
        MsaBoxesRouter.use(route, box.mods[route].app)
    }
}
const defaultImg = "<img src='data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22%23999%22%20viewBox%3D%220%200%201024%201024%22%3E%3Cpath%20d%3D%22M896%200h-768c-70.4%200-128%2057.6-128%20128v768c0%2070.4%2057.6%20128%20128%20128h768c70.4%200%20128-57.6%20128-128v-768c0-70.4-57.6-128-128-128zM896%20896h-768v-768h768v768z%22%2F%3E%3C%2Fsvg%3E'>"


registerMsaBox("msa-utils-text-box", {
    title: "Text",
    head: "/utils/msa-utils.js",
    editRef: "/utils/msa-utils.js:editMsaBoxText",
})


function useMsaBoxesRouter(app, route, getMsaBoxCtx) {
    app.use(route,
        async (req, res, next) => {
            req.msaBoxCtx = await getMsaBoxCtx(req)
            next()
        },
        MsaBoxesRouter)
}

module.exports = {
    MsaBoxes,
    MsaBoxesRouter,
    registerMsaBox,
    useMsaBoxesRouter
}