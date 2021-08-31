import * as multer from 'multer'
import * as path from "path";

export interface IImageUploader {
    upload(field: string): any
}

export type UploaderConfiguration = {dest?: string, newFileName?: (file: any) => string}

export class ImageUploader implements IImageUploader {
    private readonly imageStorage: any;
    private readonly imageUpload: any;

    private readonly _configuration: UploaderConfiguration;

    constructor(destination?: string) {
        this._configuration = {
            dest: 'images',
            newFileName: function (file: any){
                return file.originalname + '_' + Date.now() + path.extname(file.originalname)
            }
        }
        this.imageStorage = multer.diskStorage({
            // Destination to store image
            destination: destination || this._configuration.dest,
            filename: (req, file, cb) => {
                console.log('Upload image '+ file.originalname)
                cb(null, this._configuration.newFileName(file))
            }
        });

        this.imageUpload = multer({
            storage: this.imageStorage,
            //TODO: limit image size 2 mb
            // limits: {
            //     fileSize: 1000000 // 1000000 Bytes = 1 MB
            // },
            fileFilter(req, file, cb) {
                if(!file.mimetype.match(/image\/.*/))
                    return cb(new Error('File is not an image'))
                cb(undefined, true)
            }
        })
    }

    upload(field: string): any{
       return this.imageUpload.single(field)
    }

    set configuration(config: UploaderConfiguration){
        Object.assign(this._configuration , config)
    }
}