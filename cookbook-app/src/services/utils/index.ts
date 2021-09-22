export default {
    clone: function (from: object){
        return JSON.parse(JSON.stringify(from))
    },
    equals: function (o: object, o1: object){
        return JSON.stringify(o) === JSON.stringify(o1)
    },
    isString: function (v: any){
        return typeof v === 'string'
    },
    isCallable: function (v: any){
        return typeof v === 'function'
    }
}