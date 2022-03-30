"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReaderStreamVideo = exports.ReaderStreamImage = exports.ReaderStream = void 0;
class ReaderStream {
    constructor(type) {
        this.type = type;
    }
    isValid(file) {
        return file && new RegExp(this.type + '\/.*').test(file.type);
    }
    read(file, onLoad, onError) {
        onError = onError || ((e) => console.error(e));
        if (this.isValid(file)) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.addEventListener("load", onLoad);
        }
        else
            onError(new Error('File not valid'));
    }
    toFile(url) {
        if (!url)
            return Promise.reject('Url not valid');
        return fetch(url)
            .then(res => res.blob())
            .then(blob => {
            let file = new File([blob], (url === null || url === void 0 ? void 0 : url.split('/').pop()) || 'file', { type: blob.type });
            return this.isValid(file) ? Promise.resolve(file) : Promise.reject('File not valid');
        });
    }
}
exports.ReaderStream = ReaderStream;
(function (ReaderStream) {
    let Type;
    (function (Type) {
        Type["IMAGE"] = "image";
        Type["VIDEO"] = "video";
    })(Type = ReaderStream.Type || (ReaderStream.Type = {}));
})(ReaderStream = exports.ReaderStream || (exports.ReaderStream = {}));
exports.ReaderStreamImage = new ReaderStream(ReaderStream.Type.IMAGE);
exports.ReaderStreamVideo = new ReaderStream(ReaderStream.Type.VIDEO);
exports.default = {
    ReaderStreamImage: exports.ReaderStreamImage,
    ReaderStreamVideo: exports.ReaderStreamVideo
};
//# sourceMappingURL=index.js.map