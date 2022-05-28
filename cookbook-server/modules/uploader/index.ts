import * as path from "path";
import * as multer from 'multer'
import * as fs from "fs";

export type Mixed = {
    /**
     * Field name specified in the form
     */
    name: string,
    /**
     * Max number of file to upload
     */
    maxCount?: number,
    /**
     * Type of file to upload
     */
    type: FileUploader.FileType
}

export type UploaderConfiguration = {
    /**
     * Type of file to upload
     */
    type: FileUploader.FileType,
    /**
     * Destination folder
     */
    dest: string,
    /**
     * (Optional) Rename uploaded file and return the new name.
     */
    newFileName?: (file: any) => string
}

export interface IFileUploader {
    /**
     * @param field field name specified in the form
     * @param configuration instance of {@link UploaderConfiguration}
     * @return middleware to upload one file
     */
    single(field: string, configuration: UploaderConfiguration): any

    /**
     * @param fields field names specified in the form
     * @param configurations instance of {@link UploaderConfiguration}
     * @return middleware to upload more than one file
     */
    mixed(fields: Array<Mixed>, configurations: Array<UploaderConfiguration>): any
}

const KILOBYTE: number = 1024 // bytes
const MEGABYTE: number = KILOBYTE * KILOBYTE

/**
 * An implementation of {@link IFileUploader}
 */
export class FileUploader implements IFileUploader {

    private readonly fileSize: number = 512 * MEGABYTE

    mixed(fields: Array<Mixed>, configurations: Array<UploaderConfiguration>): any {
        const _configuration = (fieldName: string): (UploaderConfiguration | null) => {
            let field = fields.find(f => f.name === fieldName)
            return field ? configurations.find(c => c.type === field.type) : null
        }

        let fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                let configuration = _configuration(file.fieldname)
                this._destination(configuration ? configuration.dest : 'tmp', cb)
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
            destination: (req, file, cb) => this._destination(configuration.dest, cb),
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

    private _destination(dest: string, cb: (...args: any[]) => void): void {
        fs.mkdirSync(dest, { recursive: true })
        cb(null, dest)
    }

    private _filename(file: any, configuration: UploaderConfiguration, cb: (...args: any[]) => void): void {
        configuration.newFileName = configuration.newFileName || ((file: any) => file.originalname + '_' + Date.now() + path.extname(file.originalname).toLowerCase())
        let newFileName: string = configuration.newFileName(file)
        console.debug(`Rename ${configuration.type}: new path = ${path.join(configuration.dest, newFileName)}`)
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

    /**
     * {@link FileType} represents all the available type of file
     */
    export enum FileType {
        IMAGE = 'image',
        VIDEO = 'video'
    }

    export namespace FileType {
        /**
         * @param fileType type of file
         * @return an available extension array based on file type
         */
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
