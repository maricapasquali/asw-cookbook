import {newUser} from "../utils.user.controller";
import {RBAC} from "../../../libs/rbac";
import Role = RBAC.Role;
import {MongooseDuplicateError, MongooseValidationError} from "../../../libs/custom.errors";
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
    newUser(req, {role: Role.ADMIN})
        .save()
        .then(admin => {
            send_email_signup({ ...admin.toObject(), passwordDefault: req.locals.passwordDefault })
            return res.status(201).json({userID: admin._id})
        }, err => {
            if(MongooseValidationError.is(err)) return res.status(400).json({description: err.message})
            if(MongooseDuplicateError.is(err)) return res.status(400).json({description: "Administrator [ email = " + req.body.email  + "] has already inserted."  })
            res.status(500).json({code: 0, description: err.message})
        })
}
