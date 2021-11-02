interface IReader{
    read(file: File, onLoad: (event) => void, onError: (event) => void): void
}

export class ReaderStream implements IReader {
    private readonly type: ReaderStream.Type

    constructor(type: ReaderStream.Type) {
        this.type = type
    }

    isValid(file: File){
        return file && new RegExp(this.type + '\/.*').test(file.type)
    }

    read(file: File, onLoad: (event) => void, onError: (event) => void): void {
        if(this.isValid(file)){
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.addEventListener("load", onLoad);
        } else onError(new Error('File not valid'))
    }
}
export namespace ReaderStream {
    export enum Type {
        IMAGE = 'image',
        VIDEO = 'video'
    }
}

export const ReaderStreamImage = new ReaderStream(ReaderStream.Type.IMAGE)
export const ReaderStreamVideo = new ReaderStream(ReaderStream.Type.VIDEO)