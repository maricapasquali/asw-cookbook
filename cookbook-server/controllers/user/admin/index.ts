import * as bcrypt from 'bcrypt'

import {newUser} from "../utils.user.controller";
import {RBAC} from "../../../modules/rbac";
import Role = RBAC.Role;
import {MongooseValidationError} from "../../../modules/custom.errors";
import {User} from "../../../models";
import {SignUpAdminEmail, TemplateEmail} from "../../../modules/mailer/templates";
import {mailer, app_name, configuration} from "../utils.user.controller";

const send_email_signup = function (user) {
    const signUpEmail: TemplateEmail = new SignUpAdminEmail({
        app_name: app_name,
        firstname: user.information.firstname,
        lastname: user.information.lastname,
        email: user.information.email,
        userID: user.credential.userID,
        passwordDefault: user.passwordDefault
    })

    let html: string = signUpEmail.toHtml()
    let text: string = signUpEmail.toText()

    mailer.save(`signup-admin-${user._id}.html`, html) //FOR DEVELOP
    mailer.send({
        to: user.information.email,
        subject: 'CookBook - Registazione Amministratore',
        html: html,
        text: text
    })
}

export function signup(req, res) {
    res.set('Access-Control-Allow-Origin', configuration.server.origin);

    let {firstname, lastname, email} = req.body
    if(!(firstname && lastname && email))
        return res.status(400).json({
            description: "Body must formed: { firstname: string, lastname: string, email: string, tel_number?: string, birth_date?: string }"
        })

    let postfix = "-admin"
    let passwordDefault = "admin"

    User.find({ "credential.userID": { $regex: firstname + '*.' + postfix, $options: 'i' }})
        .sort({_id: -1})
        .then(users => {
            let number: number
            if(users.length){
                let matchs = (users[0].credential.userID.match(/(\d+)/)) || ["0"]
                number = (parseInt(matchs[0]) + 1)
            }
            req.body.userID = firstname + (number || '') + postfix
            req.body.hash_password = bcrypt.hashSync(passwordDefault, bcrypt.genSaltSync(10))
            // console.debug(req.body)

            newUser(req, {role: Role.ADMIN})
                .save()
                .then(admin => {
                        send_email_signup({...admin.toObject(), passwordDefault: passwordDefault})
                        return res.status(201).json({userID: admin._id})
                    }, err => {
                        if(MongooseValidationError.is(err)) return res.status(400).json({description: err.message})
                        res.status(500).json({code: 0, description: err.message})
                    })

        }, err => res.status(500).json({description: err.message}))
}
