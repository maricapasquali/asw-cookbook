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
    const isAbsent: boolean = (predicate && !v1.find(predicate)) || (!predicate && !_.includes(v1, val))
    if(isAbsent) v1.push(val)
}

export function removeIfPresent(v1: Array<any>, val: any,  predicate?: (v: any) => boolean): void {
    const isPresent: boolean = (predicate && v1.find(predicate)) || (!predicate && _.includes(v1, val))
    if(isPresent) v1.splice(v1.indexOf(val),1)
}

export function dateFormat(timestamp: number, lang: string = 'it'): string {
    return new Date(timestamp).toLocaleString([lang], {year: 'numeric', day: '2-digit',month:'2-digit', hour: '2-digit', minute: '2-digit'})
}