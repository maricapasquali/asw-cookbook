import * as express from 'express'
import * as path from 'path';

/**
 * Add static file on _app_
 * @param app express app
 */
export function staticFiles(app: any) {
    app.use('/images', express.static(path.join(__dirname ,'images')))
    app.use('/js', express.static(path.join(__dirname ,'js')))
    app.use('/libs', express.static(path.join(__dirname, 'node_modules')))
}

