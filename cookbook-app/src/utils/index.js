"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateFormat = exports.visitUntil = exports.flatten = exports.lastOf = exports.prepend = exports.prependIfPresent = exports.replaceIfPresent = exports.removeIfPresent = exports.prependIfAbsent = exports.pushIfAbsent = exports.diff = exports.isCallable = exports.isString = exports.isBoolean = exports.isEmpty = exports.equals = exports.clone = void 0;
const _ = require("lodash");
function clone(from) {
    return _.cloneDeep(from);
}
exports.clone = clone;
function equals(o, o1) {
    return _.isEqual(o, o1);
}
exports.equals = equals;
function isEmpty(v) {
    return _.isEmpty(v);
}
exports.isEmpty = isEmpty;
function isBoolean(v) {
    return typeof v === 'boolean';
}
exports.isBoolean = isBoolean;
function isString(v) {
    return typeof v === 'string';
}
exports.isString = isString;
function isCallable(v) {
    return typeof v === 'function';
}
exports.isCallable = isCallable;
function diff(v1, v2) {
    return _.difference(v1, v2);
}
exports.diff = diff;
function pushIfAbsent(v1, val, predicate) {
    let index = _.findIndex(v1, predicate || val);
    let index1 = isCallable(predicate) ? v1.findIndex(predicate) : v1.indexOf(val);
    let isAbsent = index === -1 && index1 === -1;
    console.debug('pushIfAbsent: found ', !isAbsent);
    if (isAbsent)
        return v1.push(val) > 0;
}
exports.pushIfAbsent = pushIfAbsent;
function prependIfAbsent(v1, val, predicate) {
    let index = _.findIndex(v1, predicate || val);
    let index1 = isCallable(predicate) ? v1.findIndex(predicate) : v1.indexOf(val);
    let isAbsent = index === -1 && index1 === -1;
    console.debug('prependIfAbsent: found ', !isAbsent);
    if (isAbsent)
        return v1.unshift(val) > 0;
}
exports.prependIfAbsent = prependIfAbsent;
function removeIfPresent(v1, predicate) {
    let index = _.findIndex(v1, predicate);
    let index1 = isCallable(predicate) ? v1.findIndex(predicate) : v1.indexOf(predicate);
    let isPresent = index !== -1 || index1 != -1;
    console.debug('removeIfPresent: found ', isPresent);
    if (isPresent)
        return v1.splice(index, 1).pop();
}
exports.removeIfPresent = removeIfPresent;
function replaceIfPresent(v1, predicate, newVal) {
    let index = _.findIndex(v1, predicate);
    let index1 = isCallable(predicate) ? v1.findIndex(predicate) : v1.indexOf(predicate);
    let isPresent = index !== -1 || index1 !== -1;
    console.debug('replaceIfPresent: found ', isPresent);
    if (isPresent)
        return v1.splice(index, 1, newVal).pop();
}
exports.replaceIfPresent = replaceIfPresent;
function prependIfPresent(v1, predicate) {
    let index = _.findIndex(v1, predicate);
    let index1 = isCallable(predicate) ? v1.findIndex(predicate) : v1.indexOf(predicate);
    let isPresent = index !== -1 || index1 !== -1;
    console.debug('prependIfPresent: found ', isPresent);
    if (isPresent)
        prepend(v1, index);
}
exports.prependIfPresent = prependIfPresent;
function prepend(v1, index) {
    if (index >= 0 && index < v1.length) {
        let val = v1.splice(index, 1).pop();
        if (val)
            v1.unshift(val);
    }
}
exports.prepend = prepend;
function lastOf(v1, filter) {
    return _.last(_.filter(v1, filter));
}
exports.lastOf = lastOf;
function flatten(vector, field) {
    const mapper = (obj) => {
        if (!obj[field] || !obj[field].length)
            return obj;
        return [obj, _.flatMapDeep(obj[field], mapper)];
    };
    return _.flatMapDeep(vector, mapper);
}
exports.flatten = flatten;
function visitUntil(vector, child, options) {
    const { flatterField, finderField, mapperField, includeChild } = options;
    const _visit = (vector1, _child, accumulator = []) => {
        let foundParent = vector1.find(v => { var _a; return (_a = v[flatterField]) === null || _a === void 0 ? void 0 : _a.find(vv => vv[finderField] === _child[finderField]); });
        if (foundParent) {
            accumulator.unshift(foundParent);
            return _visit(vector1, foundParent, accumulator);
        }
        return accumulator;
    };
    const _flattenVector = flatten(vector, flatterField);
    if (child && !child[finderField]) {
        let _copyChild = child;
        child = {};
        child[finderField] = _copyChild;
    }
    const _pathResult = _visit(_flattenVector, child || {});
    if (child && includeChild) {
        const _child = _flattenVector.find(v => v[finderField] === child[finderField]);
        if (_child)
            _pathResult.push(_child);
    }
    return mapperField && _pathResult.some(v => v.hasOwnProperty(mapperField)) ? _pathResult.map(v => v[mapperField]) : _pathResult;
}
exports.visitUntil = visitUntil;
function dateFormat(timestamp, lang = 'it', seconds) {
    return new Date(timestamp).toLocaleString([lang], {
        year: 'numeric',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: seconds ? '2-digit' : undefined
    });
}
exports.dateFormat = dateFormat;
//# sourceMappingURL=index.js.map