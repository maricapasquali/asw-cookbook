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
    return wrapUpload(fileUploader.single('img', config))
}