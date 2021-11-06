export function clone(from: object){
    return JSON.parse(JSON.stringify(from))
}

export function equals(o: object, o1: object){
    return JSON.stringify(o) === JSON.stringify(o1)
}

export function isString(v: any){
    return typeof v === 'string'
}

export function isCallable(v: any){
    return typeof v === 'function'
}

export function isEmpty(v: object){
    return typeof v === 'object' && JSON.stringify(v) === "{}"
}

export function dateFormat(timestamp: number, lang: string = 'it'){
    return new Date(timestamp).toLocaleString([lang], {year: 'numeric', day: '2-digit',month:'2-digit', hour: '2-digit', minute: '2-digit'})
}