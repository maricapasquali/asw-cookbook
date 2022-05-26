import * as fs from "fs";
import * as path from "path";
import {FilesystemResource} from "../../filesystem";

function sendFileOf(path: string, res: any): void {
    fs.promises.access(path, fs.constants.R_OK)
        .then(() => res.status(200).sendFile(path))
        .catch(err => {
            console.error(err);
            res.status(404).json({ description: "File is not found." })
        })
}

export function sendImage(req, res, next) {
    if(!path.extname(req.params.filename)) return next()

    const resource = req.params.filename.split("-")[0]
    let pathFile: string = FilesystemResource.Image.path(req.params.filename)
    switch(resource){
        case 'user': pathFile = FilesystemResource.USERS.Image(req.params.filename); break;
        case 'recipe': pathFile = FilesystemResource.RECIPES.Image(req.params.filename); break;
        case 'chat': pathFile = FilesystemResource.CHATS.Image(req.params.filename); break;
    }
    console.debug("Image: File path = ", pathFile)
    sendFileOf(pathFile, res)
}

export function sendIcon(req, res) {
    let pathFile: string = FilesystemResource.Icon.path(req.params.filename)
    console.debug("Icon: File path = ", pathFile)
    sendFileOf(pathFile, res)
}

export function sendVideo(req, res, next) {
    if(!path.extname(req.params.filename)) return next()

    const resource = req.params.filename.split("-")[0]
    let pathFile: string = FilesystemResource.Video.path(req.params.filename)
    switch(resource){
        case 'recipe': pathFile = FilesystemResource.RECIPES.Video(req.params.filename); break;
    }
    console.debug("Video: File path = ", pathFile)
    sendFileOf(pathFile, res)
}
