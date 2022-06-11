import * as path from "path";
import {Middleware, wrapUpload} from "../base";
import {FilesystemResource} from "../../filesystem";
import {randomString} from "../../libs/utilities";
import {FileUploader, UploaderConfiguration} from "../../libs/uploader";
import FileType = FileUploader.FileType;

export function uploadProfileImage(): Middleware {

    let config: UploaderConfiguration = {
        type: FileType.IMAGE,
        dest: FilesystemResource.USERS.Image(),
        newFileName: function (file: any){
            return 'user-' + randomString(30) + path.extname(file.originalname)
        }
    }
    return function (req, res, next){
        wrapUpload(fileUploader.single('img', config))(req, res, err => {
            if(err) return next(err)
            if(req.file) Object.assign(req.body, { img: req.file.filename })
            if(req.body.img?.length === 0) Object.assign(req.body, { img: null })
            next()
        })
    }
}