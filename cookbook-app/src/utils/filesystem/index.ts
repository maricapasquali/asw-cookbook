interface IReader {
    /**
     * Read the given _file_.
     * @param file file to read
     * @param onLoad callback that loads the given _file_ and returns the contents of the file when it finishes loading
     * @param onError (optional) callback that returns eventual error
     */
    read(file: File, onLoad: (result: string | ArrayBuffer) => void, onError?: (error: any) => void): void

    /**
     * @param url url to check
     * @return a promise that resolves when the URL is a file URL and rejects when the URL is invalid or the
     *         file does not belong to an available type ({@link ReaderStream.Type}).
     */
    toFile(url: string): Promise<File>
}

/**
 * An implementation of {@link IReader}.
 */
export class ReaderStream implements IReader {
    private readonly type: ReaderStream.Type

    constructor(type: ReaderStream.Type) {
        this.type = type
    }

    read(file: File, onLoad: (result: string | ArrayBuffer) => void, onError: (error: any) => void = e => console.error(e)): void {
        if(this.isValid(file)){
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.addEventListener("load", (event) => onLoad(event.target.result));
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

    private isValid(file: File){
        return file && new RegExp(this.type + '\/.*').test(file.type)
    }
}
export namespace ReaderStream {
    /**
     * {@link ReaderStream.Type} represents all the available type of file.
     */
    export enum Type {
        IMAGE = 'image',
        VIDEO = 'video'
    }
}

/**
 * An instance of {@link ReaderStream} of file type {@link ReaderStream.Type.IMAGE}.
 */
export const ReaderStreamImage = new ReaderStream(ReaderStream.Type.IMAGE)
/**
 * An instance of {@link ReaderStream} of file type {@link ReaderStream.Type.VIDEO}.
 */
export const ReaderStreamVideo = new ReaderStream(ReaderStream.Type.VIDEO)

export default {
    ReaderStreamImage,
    ReaderStreamVideo
}