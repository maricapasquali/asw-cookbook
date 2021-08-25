import {IUser} from "../../models/schemas/user";

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

export function isAlreadyLoggedOut(user: IUser): boolean {
    return !user.credential.tokens || typeof user.credential.tokens === 'number'
}

export function unixTimestampToString(ts: number, get: string = 'date_time', locals: string = 'it-IT', options: object = {}): string {
    let date = new Date(ts)
   switch (get) {
       case 'time': return date.toLocaleTimeString(locals, options)
       case 'date': return date.toLocaleDateString(locals, options)
       case 'date_time': return date.toLocaleString(locals, options)
   }
}