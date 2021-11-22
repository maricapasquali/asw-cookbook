import {IRbac, RBAC} from "../modules/rbac";
import {extractAuthorization} from "../modules/utilities";
import {IJwtToken, JwtToken} from "../modules/jwt.token";

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