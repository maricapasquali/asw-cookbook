import {RBAC} from "../../modules/rbac";
import {IUser} from "../../models/schemas/user";
import Role = RBAC.Role;
import {User} from "../../models";
import {IMailer, Mailer} from "../../modules/mailer";

import * as config from "../../../env.config"

export const configuration = config
export const app_name = config.appName
export const mailer: IMailer = new Mailer(`no-reply@${app_name.toLowerCase()}.com`);

export function newUser(req: any, options: {role: RBAC.Role}): IUser {

    let userBody = {
        credential: { userID: req.body.userID, hash_password: req.body.hash_password, role: options.role || Role.SIGNED },
        information: {}
    }
    delete req.body.userID
    delete req.body.hash_password
    userBody.information = req.body
    if(req.file) userBody.information['img'] = req.file.filename

    return new User(userBody)
}