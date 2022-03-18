interface IReader{
    read(file: File, onLoad: (event) => void, onError?: (event) => void): void
    toFile(url: string): Promise<File>
}

export class ReaderStream implements IReader {
    private readonly type: ReaderStream.Type

    constructor(type: ReaderStream.Type) {
        this.type = type
    }

    isValid(file: File){
        return file && new RegExp(this.type + '\/.*').test(file.type)
    }

    read(file: File, onLoad: (event) => void, onError?: (event) => void): void {
        onError = onError || ((e) => console.error(e))
        if(this.isValid(file)){
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.addEventListener("load", onLoad);
        } else onError(new Error('File not valid'))
    }

    toFile(url: string): Promise<File> {
        if(!url) return Promise.reject('Url not valid')
        return fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    let file = new File([blob], url?.split('/').pop() || 'file', {type: blob.type})
                    return this.isValid(file) ? Promise.resolve(file) : Promise.reject('File not valid')
                })
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

export default {
    ReaderStreamImage,
    ReaderStreamVideo
}