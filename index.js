const box = require('./box')

class MsaUtilsModule extends Msa.Module {
    constructor() {
        super()
        this.initApp()
    }

    initApp() {
        this.app.get("/boxes", (req, res, next) => {
            res.json(box.MsaBoxes)
        })
    }
}

module.exports = {
    startMsaModule: () => new MsaUtilsModule(),
    ...require('./htmlExpr'),
    ...box
}