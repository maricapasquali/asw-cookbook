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

export function dateFormat(timestamp: number, lang: string = 'it'): string {
    return new Date(timestamp).toLocaleString([lang], {year: 'numeric', day: '2-digit',month:'2-digit', hour: '2-digit', minute: '2-digit'})
}