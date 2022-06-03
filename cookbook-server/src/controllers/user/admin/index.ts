import * as bcrypt from 'bcrypt'

import {newUser} from "../utils.user.controller";
import {RBAC} from "../../../libs/rbac";
import Role = RBAC.Role;
import {MongooseDuplicateError, MongooseValidationError} from "../../../libs/custom.errors";
import {User} from "../../../models";
import {TemplateEmail} from "../../../libs/mailer/templates";

const send_email_signup = function (user) {
    const signUpEmail: TemplateEmail = TemplateEmail.createSignUpAdminEmail({
        app_name: app_name,
        firstname: user.information.firstname,
        lastname: user.information.lastname,
        email: user.information.email,
        userID: user.credential.userID,
        passwordDefault: user.passwordDefault
    })
    mailer.send({
        to: user.information.email,
        subject: configuration.appName + ' - Registazione Amministratore',
    }, signUpEmail, {savedJSON: {filename: `signup-admin-${user._id}`} /*FOR DEVELOP*/})
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
                        if(MongooseDuplicateError.is(err)) return res.status(400).json({description: "Administrator [ email = " +email  + "] has already inserted."  })
                        res.status(500).json({code: 0, description: err.message})
                    })

        }, err => res.status(500).json({description: err.message}))
}
