const { join } = require('path')
const fs = require('fs')
const box = require('./box')

class MsaUtilsModule extends Msa.Module {
    constructor() {
        super()
        this.initImgs()
        this.initApp()
    }

    initImgs() {
        // create dictionary that will allow to GET static image files, without knowing the extension
        this.fnamesWoExt = {}
        const imgDir = join(__dirname, "static/img")
        fs.readdir(imgDir, (err, fnames) => {
            if(err) console.error("ERROR", err)
            else for(let fname of fnames) {
                const fnameWoExt = fname.split('.').slice(0, -1).join('.')
                if(fnameWoExt) this.fnamesWoExt[fnameWoExt] = fname
            }
        })
    }

    initApp() {
        this.app.get("/boxes", (req, res, next) => {
            res.json(box.MsaBoxes)
        })

        this.app.get("/img/*", (req, res, next) => {
            // add extension to image filename if necessary
            const fname = req.params[0]
            if(fname in this.fnamesWoExt) {
                req.url = `/img/${this.fnamesWoExt[fname]}`
            }
            next()
        })
    }
}

module.exports = {
    startMsaModule: () => new MsaUtilsModule(),
    ...require('./htmlExpr'),
    ...box
}