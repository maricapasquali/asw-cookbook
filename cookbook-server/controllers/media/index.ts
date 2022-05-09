import * as fs from "fs";
import * as path from "path";

enum MediaResource {
    RECIPES = "recipes",
    CHATS = "chats",
    USERS = "users"
}
namespace MediaResource {
    type Path = { path(filename: string, resource?: MediaResource): string }

    export const Image: Path = {
        path(filename: string, resource?: MediaResource): string {
            return path.resolve("filesystem", resource || "", "images", filename)
        }
    }

    export const Video: Path = {
        path(filename: string, resource?: MediaResource): string {
            return path.resolve("filesystem", resource || "", "videos", filename)
        }
    }
}

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
    let pathFile: string = MediaResource.Image.path(req.params.filename)
    switch(resource){
        case 'user': pathFile = MediaResource.Image.path(req.params.filename, MediaResource.USERS); break;
        case 'recipe': pathFile = MediaResource.Image.path(req.params.filename, MediaResource.RECIPES); break;
        case 'chat': pathFile = MediaResource.Image.path(req.params.filename, MediaResource.CHATS); break;
    }
    console.debug("Image: File path = ", pathFile)
    sendFileOf(pathFile, res)
}

export function sendVideo(req, res, next) {
    if(!path.extname(req.params.filename)) return next()

    const resource = req.params.filename.split("-")[0]
    let pathFile: string = MediaResource.Video.path(req.params.filename)
    switch(resource){
        case 'recipe': pathFile = MediaResource.Video.path(req.params.filename, MediaResource.RECIPES); break;
    }
    console.debug("Video: File path = ", pathFile)
    sendFileOf(pathFile, res)
}