import * as _ from 'lodash'
import {isCallable} from "../lang";

/**
 * @param v1 array of values to inspect
 * @param v2 array of values to exclude
 * @return new array of filtered values
 */
export function diff(v1: Array<any>, v2: Array<any>): Array<any> {
    return _.difference(v1, v2)
}

/**
 * @param v1 array of values to modify
 * @param val value to append
 * @param predicate (optional) function used to find the value to append
 * @return true if _val_ is not present in the array and the operation of append successes, otherwise false
 */
export function pushIfAbsent(v1: Array<any>, val: any, predicate?: (v: any) => boolean): boolean {
    let _oldLen: number = v1.length
    let index: number = _.findIndex(v1, predicate || val)
    let index1: number = isCallable(predicate) ? v1.findIndex(predicate): v1.indexOf(val)
    let isAbsent: boolean = index === -1 && index1 === -1
    console.debug('pushIfAbsent: found ', !isAbsent)
    if(isAbsent) return v1.push(val) > _oldLen
    return false
}

/**
 * @param v1 array of values to modify
 * @param val value to prepend
 * @param predicate (optional) function used to find the value to prepend or value to prepend
 * @return true if _val_ is not present in the array and the operation of prepend successes, otherwise false
 */
export function prependIfAbsent(v1: Array<any>, val: any, predicate?: (v: any) => boolean | any): boolean {
    let _oldLen: number = v1.length
    let index: number =  _.findIndex(v1, predicate || val)
    let index1: number = isCallable(predicate) ? v1.findIndex(predicate) : v1.indexOf(val)
    let isAbsent: boolean = index === -1 && index1 === -1
    console.debug('prependIfAbsent: found ', !isAbsent)
    if(isAbsent) return v1.unshift(val) > _oldLen
    return false
}

/**
 * @param v1 array of values to modify
 * @param predicate function used to find the value to remove or value to remove
 * @return removed element from the array; undefined if the _predicate_ is not present or the operation fails
 */
export function removeIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any): any {
    let index: number =  _.findIndex(v1, predicate)
    let index1: number = isCallable(predicate) ? v1.findIndex(predicate): v1.indexOf(predicate)
    let isPresent: boolean = index !== -1 || index1 != -1
    console.debug('removeIfPresent: found ', isPresent)
    if(isPresent) return v1.splice(index,1).pop()
}

/**
 * @param v1 array of values to modify
 * @param predicate function used to find the value to replace or value to replace
 * @param newVal new value to replace the old one
 * @return old element from the array; undefined if the _predicate_ is not present or the operation fails
 */
export function replaceIfPresent(v1: Array<any>, predicate: (v: any) => boolean | any, newVal: any): any {
    let index: number =  _.findIndex(v1, predicate)
    let index1: number = isCallable(predicate) ? v1.findIndex(predicate): v1.indexOf(predicate)
    let isPresent: boolean = index !== -1 || index1 !== -1
    console.debug('replaceIfPresent: found ', isPresent)
    if(isPresent) return v1.splice(index,1, newVal).pop()
}

/**
 * Move the value _predicate_ to first position to the array.
 * @param v1 array of values to modify
 * @param predicate function used to find the value to move or value to move
 */
export function moveInFirstPosition(v1: Array<any>, predicate: (v: any) => boolean | any): void {
    let index: number =  _.findIndex(v1, predicate)
    let index1: number = isCallable(predicate) ? v1.findIndex(predicate): v1.indexOf(predicate)
    let isPresent: boolean = index !== -1 || index1 !== -1
    console.debug('moveInFirstPosition: found ', isPresent)
    if(isPresent) prepend(v1, index)
}

/**
 * Move the value from the index _index_ to first position to the array.
 * @param v1 array of values to modify
 * @param index index of value to move
 */
export function prepend(v1: Array<any>, index: number): void {
    if(index >= 0 && index < v1.length) {
        let val = v1.splice(index, 1).pop()
        if(val) v1.unshift(val)
    }
}

/**
 * @param v1 array of values to query
 * @param filter (optional) function used to filter or values to filter
 * @return the last element of array
 */
export function lastOf(v1: Array<any>, filter?: (v: any) => boolean | any): any {
    return _.last(_.filter(v1, filter));
}

/**
 * @param vector array of values to iterate over. Each element is structured as tree, which nodes are connected with edges defined by the field _{@link field}_
 * @param field field on which to perform the flatten operation
 * @return new flattened array
 * @example
 *
 * interface ExampleFriends {
 *     name: string
 *     friends: ExampleFriends[]
 * }
 * let users: ExampleFriends[] = [
 *      {
 *          name: "carlo",
 *          friends: [
 *              {name: "anna", friends: []},
 *              {name: "kira", friends: [{name: "anna maria", friends: []}]}
 *          ]
 *      },
 *      {
 *          name: "mario",
 *          friends: [
 *              {name: "john", friends: [{name: "aldo", friends: []}]},
 *              {name: "giovanni", friends: []},
 *          ]
 *      }
 * ];
 *
 * flatten(users, "friends")
 * // Result is :
 * [
 *      {
 *          name:"carlo",
 *          friends:[
 *              {name:"anna", friends:[]},
 *              {
 *                  name:"kira",
 *                  friends:[{name:"anna maria",friends:[]}]
 *              }
 *          ]
 *      },
 *      {
 *          name:"anna",
 *          friends:[]
 *      },
 *      {
 *          name:"kira",
 *          friends:[
 *              {name:"anna maria",friends:[]}
 *          ]
 *      },
 *      {
 *          name:"anna maria",
 *          friends:[]
 *      },
 *      {
 *          name:"mario",
 *          friends:[
 *              {
 *                  name:"john",
 *                  friends:[{name:"aldo",friends:[]}]
 *              },
 *              {name:"giovanni",friends:[]}
 *           ]
 *      },
 *      {
 *          name:"john",
 *          friends:[{name:"aldo",friends:[]}]
 *      },
 *      {
 *          name:"aldo",
 *          friends:[]
 *      },
 *      {
 *          name:"giovanni",
 *          friends:[]
 *      },
 *  ]
 */
export function flatten(vector: Array<object>, field: string): Array<object> {
    const mapper = (obj: object): Array<object> | object => {
        if(!obj[field] || !obj[field].length) return obj;
        return [obj, _.flatMapDeep(obj[field], mapper)];
    }
    return _.flatMapDeep(vector, mapper);
}

export type VisitOptions = {
    /**
     * field on which to visit
     */
    flatterField: string,
    /**
     * field on which to go to look for the child
     */
    finderField: string,
    /**
     * (optional) field on which to map the result of the visit
     */
    mapperField?: string,
    /**
     * (optional) if it is true, the result of the visit also includes the given child
     */
    includeChild?: boolean
}
/**
 * @param vector array of values to iterate over. Each element is structured as tree, which nodes are connected with edges defined by the field _{@link VisitOptions.flatterField}_
 * @param child value to found using {@link VisitOptions.finderField}
 * @param options instance of {@link VisitOptions}
 * @return array of values that represents path of the given value (_child_). If {@link VisitOptions.includeChild} is true, the last element of array (path) is _child_
 * @example
 * interface ExampleUsers {
 *     _id: string
 *     users: ExampleUsers[]
 * }
 *
 * // LEVEL 3
 * let user221: ExampleUsers = {
 *     _id: "221",
 *     users: []
 * }
 *
 * let user121: ExampleUsers = {
 *     _id: "121",
 *     users: []
 * }
 * let user122: ExampleUsers = {
 *     _id: "122",
 *     users: []
 * }
 * let user123: ExampleUsers = {
 *     _id: "123",
 *     users: []
 * }
 *
 * let user111: ExampleUsers = {
 *     _id: "111",
 *     users: []
 * }
 * let user112: ExampleUsers = {
 *     _id: "112",
 *     users: []
 * }
 *
 * // LEVEL 2
 * let user31: ExampleUsers = {
 *     _id: "31",
 *     users: []
 * }
 *
 * let user22: ExampleUsers = {
 *     _id: "22",
 *     users: [user221]
 * }
 * let user21: ExampleUsers = {
 *     _id: "21",
 *     users: []
 * }
 *
 * let user12: ExampleUsers = {
 *     _id: "12",
 *     users: [user121, user122, user123]
 * }
 * let user11: ExampleUsers = {
 *     _id: "11",
 *     users: [user111, user112]
 * }
 *
 * //LEVEL 1
 * let user1: ExampleUsers = {
 *     _id: "1",
 *     users: [user11, user12]
 * }
 *
 * let user2: ExampleUsers = {
 *     _id: "2",
 *     users: [user21, user22]
 * }
 *
 * let user3: ExampleUsers = {
 *     _id: "3",
 *     users: [user31]
 * }
 *
 * visitUntil([user1, user2, user3], user123, {
 *     finderField: "_id",
 *     flatterField: "users",
 *     includeChild: true
 * })
 * // Result is :
 * [
 *     {
 *         _id: "1",
 *         users: [...]
 *     },
 *     {
 *         _id: "12",
 *         users: [...]
 *     },
 *     {
 *         _id: "123",
 *         users: []
 *     }
 * ]
 */
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
