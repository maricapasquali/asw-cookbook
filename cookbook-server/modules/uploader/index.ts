import * as path from "path";
import * as multer from 'multer'

export type Mixed = {name: string, maxCount?: number, type: FileUploader.FileType}
export type UploaderConfiguration = {type: FileUploader.FileType, dest: string, newFileName?: (file: any) => string}

export interface IFileUploader {
    single(field: string, configuration: UploaderConfiguration): any
    mixed(fields: Array<Mixed>, configuration: Array<UploaderConfiguration>): any
}

export class FileUploader implements IFileUploader {

    mixed(fields: Array<Mixed>, configurations: Array<UploaderConfiguration>): any {

        const getConfiguration = (fieldName: string): (UploaderConfiguration | null) => {
            let field = fields.find(f => f.name === fieldName)
            return field ? configurations.find(c => c.type === field.type) : null
        }

        let fileStorage = multer.diskStorage({
            destination: function (req, file, cb){
                let configuration = getConfiguration(file.fieldname)
                return cb(null,  configuration ? configuration.dest : 'tmp')
            },
            filename: (req, file, cb) => {
                let configuration = getConfiguration(file.fieldname)
                console.debug('Upload ' + configuration.type + ' : ' + file.originalname)
                configuration.newFileName = configuration.newFileName || ((file: any) => file.originalname + '_' + Date.now() + path.extname(file.originalname))
                cb(null, configuration.newFileName(file))
            }
        });

        return multer({
            storage: fileStorage,
            //TODO: multi => make limit size for upload image/video/...
            // limits: {
            //     fileSize: 1000000 // 1000000 Bytes = 1 MB
            // },
            fileFilter: (req, file, cb) => {
                if(!file.mimetype.match(configurations.map(c => c.type + '\/.*').join('|')))
                    return cb(new Error('File is not an ' + file.mimetype))
                cb(undefined, true)
            }
        }).fields(fields)
    }

    single(field: string, configuration: UploaderConfiguration): any{
        let fileStorage = multer.diskStorage({
            // Destination to store image
            destination: configuration.dest,
            filename: (req, file, cb) => {
                console.debug('Upload ' + configuration.type + ' : ' + file.originalname)
                configuration.newFileName = configuration.newFileName ||  ((file: any) => file.originalname + '_' + Date.now() + path.extname(file.originalname))
                cb(null, configuration.newFileName(file))
            }
        });

        return multer({
            storage: fileStorage,
            //TODO: single => make limit size for upload image/video/...
            // limits: {
            //     fileSize: 1000000 // 1000000 Bytes = 1 MB
            // },
            fileFilter: (req, file, cb) => {
                if(!file.mimetype.match(configuration.type + '\/.*'))
                    return cb(new Error('File is not an ' + configuration.type))
                cb(undefined, true)
            }
        }).single(field)
    }
}

export namespace FileUploader {
    export enum FileType{ IMAGE = 'image', VIDEO = 'video'  }
}