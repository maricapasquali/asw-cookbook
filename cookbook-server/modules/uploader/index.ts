import * as path from "path";
import * as multer from 'multer'

export type Mixed = {
    name: string,
    maxCount?: number,
    type: FileUploader.FileType
}

export type UploaderConfiguration = {
    type: FileUploader.FileType,
    dest: string,
    newFileName?: (file: any) => string
}

export interface IFileUploader {
    single(field: string, configuration: UploaderConfiguration): any
    mixed(fields: Array<Mixed>, configurations: Array<UploaderConfiguration>): any
}

const KILOBYTE: number = 1024 // bytes
const MEGABYTE: number = KILOBYTE * KILOBYTE

export class FileUploader implements IFileUploader {

    private readonly fileSize: number = 512 * MEGABYTE

    mixed(fields: Array<Mixed>, configurations: Array<UploaderConfiguration>): any {
        const _configuration = (fieldName: string): (UploaderConfiguration | null) => {
            let field = fields.find(f => f.name === fieldName)
            return field ? configurations.find(c => c.type === field.type) : null
        }

        let fileStorage = multer.diskStorage({
            destination: function (req, file, cb){
                let configuration = _configuration(file.fieldname)
                return cb(null,  configuration ? configuration.dest : 'tmp')
            },
            filename: (req, file, cb) => this._filename(file, _configuration(file.fieldname), cb)
        });

        return multer({
            storage: fileStorage,
            limits: {
                fileSize: this.fileSize
            },
            fileFilter: (req, file, cb) => {
                let configuration = _configuration(file.fieldname)
                Promise.all([
                    this.checkType(file, ...configurations.map(c => c.type)),
                    this.checkAvailableExtension(file, configuration)
                ])
                .then(() => cb(null, true))
                .catch(cb)
            }
        }).fields(fields)
    }

    single(field: string, configuration: UploaderConfiguration): any {
        let fileStorage = multer.diskStorage({
            destination: configuration.dest,
            filename: (req, file, cb) => this._filename(file, configuration, cb)
        });

        return multer({
            storage: fileStorage,
            limits: {
                fileSize: this.fileSize
            },
            fileFilter: (req, file, cb) => {
                Promise.all([
                    this.checkType(file, configuration.type),
                    this.checkAvailableExtension(file, configuration)
                ])
                .then(() => cb(null, true))
                .catch(cb)
            }

        }).single(field)
    }

    private _filename(file: any, configuration: UploaderConfiguration, cb: (...args: any[]) => void): void {
        configuration.newFileName = configuration.newFileName || ((file: any) => file.originalname + '_' + Date.now() + path.extname(file.originalname).toLowerCase())
        let newFileName: string = configuration.newFileName(file)
        console.debug(`Rename ${configuration.type}: new path = /${configuration.type}/${newFileName}`)
        cb(null, newFileName)
    }

    private checkType(file: any, ...expectedTypes: FileUploader.FileType[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if(!file.mimetype.match(expectedTypes.map(type => type + '\/.*').join('|')))
                return reject(new Error('File is not an ' + expectedTypes.join(' or ')))
            resolve()
        })
    }

    private checkAvailableExtension(file: any, configuration: UploaderConfiguration): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let ext: string = path.extname(file.originalname).toLowerCase().replace("\.", "")
            if(!FileUploader.FileType.availableFileExtension(configuration.type).includes(ext))
                return reject(new Error(`'${ext}' is not an available extension for type '${configuration.type}'`))
            resolve()
        })
    }
}

export namespace FileUploader {

    export enum FileType {
        IMAGE = 'image',
        VIDEO = 'video'
    }

    export namespace FileType {

        export function availableFileExtension(fileType: FileType): string[] {
            switch (fileType) {
                case FileUploader.FileType.IMAGE:
                    return ['png', 'jpg', 'jpeg', 'gif']
                case FileUploader.FileType.VIDEO:
                    return ['mp4', 'mkv']
            }
        }
    }
}
