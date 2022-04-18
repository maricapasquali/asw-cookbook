import {RBAC} from "../../modules/rbac";
import {IUser} from "../../models/schemas/user";
import Role = RBAC.Role;
import {User} from "../../models";

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