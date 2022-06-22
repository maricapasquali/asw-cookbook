import { RBAC } from "../../libs/rbac"
import { IUser } from "../../models/schemas/user"
import { User } from "../../models"
import Role = RBAC.Role

export function newUser(req: any, options: {role: RBAC.Role}): IUser {
    const userBody: any = {
        credential: { userID: req.body.userID, hash_password: req.body.hash_password, role: options.role || Role.SIGNED },
        information: {}
    }
    delete req.body.userID
    delete req.body.hash_password
    userBody.information = req.body
    if (req.file) userBody.information.img = req.file.filename

    return new User(userBody)
}
