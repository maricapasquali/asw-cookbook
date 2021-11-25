import {IRbac, RBAC} from "../modules/rbac";
import {extractAuthorization} from "../modules/utilities";
import {IJwtToken, JwtToken} from "../modules/jwt.token";
import {FileUploader, IFileUploader, UploaderConfiguration} from "../modules/uploader";
import FileType = FileUploader.FileType;
import * as path from "path";
import {Document, Query} from "mongoose";

const tokensManager: IJwtToken = new JwtToken()
const accessManager: IRbac = new RBAC()

export function userIsAuthorized(req, res, options: {operation: RBAC.Operation, subject: RBAC.Subject, others?: (decodedToken: {_id: String, role: String}) => boolean}): {_id: string, role: string} | false {
    const {access_token} = extractAuthorization(req.headers)
    if(!access_token) {
        res.status(400).json({description: 'Missing authorization.'})
        return false
    }
    let decoded_token = tokensManager.checkValidityOfToken(access_token);
    if(!decoded_token) {
        res.status(401).json({description: 'User is not authenticated'})
        return false
    }
    options.others = options.others || (() => false)
    if(!accessManager.isAuthorized(decoded_token.role, options.operation, options.subject, options.others(decoded_token))) {
        res.status(403).json({description: 'User is unauthorized'})
        return false
    }
    return decoded_token
}

export const fileUploader: IFileUploader = new FileUploader()

export const FileConfigurationImage: UploaderConfiguration = {
    type: FileType.IMAGE,
    dest: path.resolve('cookbook-server/images'),
}

export const FileConfigurationVideo: UploaderConfiguration = {
    type: FileType.VIDEO,
    dest: path.resolve('cookbook-server/videos'),
}

export type PaginationOptions = { page: number, limit: number }
export type PaginationResult = { items: Document[], total: number, paginationInfo?: PaginationOptions }
export function pagination(lazyQuery: () => Query<Document[], Document, {}, Document>, options?: PaginationOptions): Promise<PaginationResult> {
    return lazyQuery().countDocuments()
                .then(nDocs => {
                    let _query = lazyQuery()
                    let _paginationInfo = options
                    if(options && (options.page && options.limit)) _query = _query.limit(options.limit).skip((options.page - 1) * options.limit)
                    else _paginationInfo = undefined
                    return _query.then(docs => Promise.resolve({ items: docs, total: nDocs, paginationInfo: _paginationInfo }), err => Promise.reject(err))
                }, err => Promise.reject(err))
}