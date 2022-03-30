import * as _ from 'lodash'

export function clone(from: object){
    return _.cloneDeep(from)
}

export function equals(o: object, o1: object): boolean {
    return _.isEqual(o, o1)
}

export function isEmpty(v: any): boolean {
    return _.isEmpty(v)
}

export function isBoolean(v: any): boolean {
    return typeof v === 'boolean'
}

export function isString(v: any): boolean {
    return typeof v === 'string'
}

export function isCallable(v: any): boolean {
    return typeof v === 'function'
}

export function diff(v1: Array<any>, v2: Array<any> ): Array<any> {
    return _.difference(v1, v2)
}

export function pushIfAbsent(v1: Array<any>, val: any, predicate?: (v: any) => boolean): boolean {
    let index: number = _.findIndex(v1, predicate || val)
    let index1: number = isCallable(predicate) ? v1.findIndex(predicate): v1.indexOf(val)
    let isAbsent: boolean = index === -1 && index1 === -1
    console.debug('pushIfAbsent: found ', !isAbsent)
    if(isAbsent) return v1.push(val) > 0
}

export function prependIfAbsent(v1: Array<any>, val: any, predicate?: (v: any) => boolean | any): boolean {
    let index: number =  _.findIndex(v1, predicate || val)
    let index1: number = isCallable(predicate) ? v1.findIndex(predicate) : v1.indexOf(val)
    let isAbsent: boolean = index === -1 && index1 === -1
    console.debug('prependIfAbsent: found ', !isAbsent)
    if(isAbsent) return v1.unshift(val) > 0
}

export function removeIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any): any {
    let index: number =  _.findIndex(v1, predicate)
    let index1: number = isCallable(predicate) ? v1.findIndex(predicate): v1.indexOf(predicate)
    let isPresent: boolean = index !== -1 || index1 != -1
    console.debug('removeIfPresent: found ', isPresent)
    if(isPresent) return v1.splice(index,1).pop()
}

export function replaceIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any, newVal: any): any {
    let index: number =  _.findIndex(v1, predicate)
    let index1: number = isCallable(predicate) ? v1.findIndex(predicate): v1.indexOf(predicate)
    let isPresent: boolean = index !== -1 || index1 !== -1
    console.debug('replaceIfPresent: found ', isPresent)
    if(isPresent) return v1.splice(index,1, newVal).pop()
}

export function prependIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any): void {
    let index: number =  _.findIndex(v1, predicate)
    let index1: number = isCallable(predicate) ? v1.findIndex(predicate): v1.indexOf(predicate)
    let isPresent: boolean = index !== -1 || index1 !== -1
    console.debug('prependIfPresent: found ', isPresent)
    if(isPresent) prepend(v1, index)
}

export function prepend(v1: Array<any>, index: number): void {
    if(index >= 0 && index < v1.length) {
        let val = v1.splice(index, 1).pop()
        if(val) v1.unshift(val)
    }
}

export function lastOf(v1: Array<any>, filter?: (v: any) => boolean | any): any {
    return _.last(_.filter(v1, filter));
}

export function flatten(vector: Array<object>, field: string): Array<object> {
   const mapper = (obj: object): Array<object> | object => {
       if(!obj[field] || !obj[field].length) return obj;
       return [obj, _.flatMapDeep(obj[field], mapper)];
   }
   return _.flatMapDeep(vector, mapper);
}

type VisitOptions = { flatterField: string, finderField: string, mapperField?: string, includeChild?: boolean }
export function visitUntil(vector: Array<object>, child: object, options: VisitOptions): Array<object> {
    const { flatterField, finderField, mapperField, includeChild } = options

    const _visit = (vector1: Array<object>, _child: object, accumulator: Array<object> = []): Array<object> => {
        let foundParent = vector1.find(v => v[flatterField]?.find(vv => vv[finderField] === _child[finderField]))
        if(foundParent) {
            accumulator.unshift(foundParent)
            return _visit(vector1, foundParent, accumulator)
        }
        return accumulator
    }

    const _flattenVector = flatten(vector, flatterField)
    if(child && !child[finderField]) {
        let _copyChild = child
        child = {}
        child[finderField] = _copyChild
    }
    const _pathResult = _visit(_flattenVector, child || {})
    if(child && includeChild){
        const _child = _flattenVector.find(v => v[finderField] === child[finderField])
        if(_child) _pathResult.push(_child)
    }
    return mapperField && _pathResult.some(v => v.hasOwnProperty(mapperField)) ? _pathResult.map(v => v[mapperField]) : _pathResult
}

export function dateFormat(timestamp: number, lang: string = 'it', seconds?: boolean ): string {
    return new Date(timestamp).toLocaleString([lang], {
        year: 'numeric',
        day: '2-digit',
        month:'2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: seconds ? '2-digit':  undefined
    })
}
