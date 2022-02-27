import * as _ from 'lodash'
import * as cloneDeep from 'lodash.clonedeep'
import * as isEqual from 'lodash.isequal'

export function clone(from: object){
    return cloneDeep(from)
}

export function equals(o: object, o1: object): boolean {
    return isEqual(o, o1)
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

export function pushIfAbsent(v1: Array<any>, val: any, predicate?: (v: any) => boolean): void {
    let index: number =  _.findIndex(v1, predicate || val)
    let isAbsent: boolean = index === -1
    console.debug('pushIfAbsent: found ', !isAbsent)
    if(isAbsent) v1.push(val)
}

export function removeIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any): void {
    let index: number =  _.findIndex(v1, predicate)
    let isPresent: boolean = index !== -1
    console.debug('removeIfPresent: found ', isPresent)
    if(isPresent) v1.splice(index,1)
}

export function contain(v1: Array<any>, val: any): boolean {
    let index: number =  _.findIndex(v1, val)
    let isPresent: boolean = index !== -1
    console.debug('contain: found ', isPresent)
    return isPresent
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
