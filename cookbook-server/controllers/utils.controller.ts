import {IRbac, RBAC} from "../modules/rbac";
import Operation = RBAC.Operation;
import Subject = RBAC.Subject;
import {DecodedTokenType, IJwtTokensManager, JwtTokensManager} from "../modules/jwt.token";
import {FileUploader, IFileUploader, UploaderConfiguration} from "../modules/uploader";
import FileType = FileUploader.FileType;
import * as path from "path";
import {Document, Model, Query} from "mongoose";

import * as config from "../../environment/env.config"
const server_api_origin = config.server["sub-domain"].api.origin
const client_origin = config.client.origin

export const tokensManager: IJwtTokensManager = new JwtTokensManager(client_origin, server_api_origin)
export const accessManager: IRbac = new RBAC()

type AuthorizationValue = {userID: string, password: string} | {access_token: string}
export function extractAuthorization(headers): AuthorizationValue | any {
    if(!headers.authorization) return {access_token: undefined}
    const [type, value] = headers.authorization.split(' ')
    switch (type){
        case 'Basic': {
            let buff = Buffer.from(value, 'base64');
            let [userID, password] = buff.toString('utf-8').split(':');
            return {userID: userID, password: password}
        }
        case 'Bearer': {
            return {access_token: value}
        }
        default: throw new Error(type + ' not implemented')
    }
}

export function getRestrictedUser(req: any, res?: any, options?: {operation: Operation, subject: Subject, others?: (decodedToken: DecodedTokenType) => boolean}): DecodedTokenType | false {
    const {access_token} = extractAuthorization(req.headers)
    if(!access_token) {
        if(res) res.status(400).json({description: 'Missing authorization.'})
        return false
    }
    let decoded_token = tokensManager.checkValidityOfToken(access_token);
    if(!decoded_token) {
        if(res) res.status(401).json({description: 'User is not authenticated'})
        return false
    }
    if(options){
        options.others = options.others || (() => false)
        if(!accessManager.isAuthorized(decoded_token.role, options.operation, options.subject, options.others(decoded_token))) {
            if(res) res.status(403).json({description: 'User is unauthorized'})
            return false
        }
    }
    return decoded_token
}

export function getUser(req: any, res?: any, options?: {operation: Operation, subject: Subject, others?: (decodedToken: DecodedTokenType) => boolean}): Promise<DecodedTokenType | undefined>{
    const {access_token} = extractAuthorization(req.headers)
    let user: DecodedTokenType = undefined;
    if(access_token){
        let decoded_token = tokensManager.checkValidityOfToken(access_token);
        if(!decoded_token) {
            if(res) res.status(401).json({description: 'User is not authenticated'})
            return Promise.reject(401)
        }

        if(options) {
            options.others = options.others || (() => false)
            if(!accessManager.isAuthorized(decoded_token.role, options.operation, options.subject, options.others(decoded_token))){
                if(res) res.status(403).json({description: 'User is unauthorized to execute this function.'})
                return Promise.reject(403)
            }
        }

        user = decoded_token
    }
    return Promise.resolve(user)
}

export function checkRequestHeaders(req: any, res: any, headersToCheck: object): boolean {
    let headersNotValid: object = Object.entries(headersToCheck)
                                        .filter(([key, value]) => {
                                            let header = req.get(key)
                                            return !header || header.search(value) == -1
                                        })
                                        .reduce((prev, current) => {
                                            prev[current[0]] = current[1];
                                            return prev;
                                        }, {});
    if(Object.keys(headersNotValid).length > 0)  {
        console.debug(headersNotValid)
        res.status(400).json({description: 'Headers are not correct. Correct headers : ' + JSON.stringify(headersNotValid) })
        return false
    }
    return true
}

export const fileUploader: IFileUploader = new FileUploader()

export const FileConfigurationImage: UploaderConfiguration = {
    type: FileType.IMAGE,
    dest: path.resolve('images'),
}

export const FileConfigurationVideo: UploaderConfiguration = {
    type: FileType.VIDEO,
    dest: path.resolve('videos'),
}

export type PaginationOptions = { page: number, limit: number, skip?: number }
export type PaginationResult = { items: Document[], total: number, paginationInfo?: PaginationOptions }
export function pagination(query: Query<Document[], Document, {}, Document>, options?: PaginationOptions): Promise<PaginationResult> {
    let qc = query.toConstructor()
    return query.countDocuments()
                .then(nDocs => {
                    if(nDocs == 0) return Promise.resolve({ items: [] as Document[] , total: nDocs, paginationInfo: options })
                    let _query = new qc()
                    let _paginationInfo = options
                    if(options) {
                        console.debug('pagination: ', _paginationInfo)
                        _query = _query.limit(options.limit).skip(((options.page - 1) * options.limit) + (options.skip || 0))
                    }
                    else _paginationInfo = undefined
                    return _query.then(docs => Promise.resolve({ items: docs, total: nDocs, paginationInfo: _paginationInfo }), err => Promise.reject(err))
                }, err => Promise.reject(err))
}
export function paginationOf(array: Array<any>, options?: PaginationOptions): PaginationResult {
    let start: number = 0
    let end: number = array.length
    if(options){
        start = ((options.page - 1) * options.limit) + (options.skip || 0)
        end = start + options.limit
        console.debug('start = ', start, ', end = ', end)
    }
    return { items: array.slice(start, end), total: array.length, paginationInfo: options }
}

export async function existById(model: Model<any>, values: Array<string>, filters: object = {}): Promise<true>{
    if(values.length === 0) return Promise.reject('empty')
    let notValid: Array<string> = []
    for (const value of values){
        const doesExit = await model.exists(Object.assign(filters, {_id: value})).catch(err => console.error(err))
        if (!doesExit) notValid.push(value)
    }
    return notValid.length > 0 ? Promise.reject(notValid) : Promise.resolve(true)
}
