import * as bcrypt from 'bcrypt'
import {Middlewares, Middleware} from "../../base";
import {uploadProfileImage} from "../base";
import {User} from "../../../models";

function allowOriginOnlyServer(): Middleware {
    return function (req, res, next){
        res.set('Access-Control-Allow-Origin', configuration.server.origin);
        next()
    }
}

export function create(): Middlewares {
    return [
        allowOriginOnlyServer(),
        uploadProfileImage(),
        // Check parameters, queries, body of request
        function (req, res, next){
            req.locals = req.locals || {}
            let {firstname, lastname, email} = req.body
            if(!(firstname && lastname && email))
                return next({ status: 400, description: "Body must formed: { firstname: string, lastname: string, email: string, tel_number?: string, birth_date?: string }"})

            const postfix = "-admin"

            return User.find({ "credential.userID": { $regex: firstname + '*.' + postfix, $options: 'i' }})
                       .sort({_id: -1})
                       .then(users => {
                           let number: number
                           if(users.length){
                               let matches = (users[0].credential.userID.match(/(\d+)/)) || ["0"]
                               number = (parseInt(matches[0]) + 1)
                           }
                           let passwordDefault = "admin"

                           req.body.userID = firstname + (number || '') + postfix
                           req.body.hash_password = bcrypt.hashSync(passwordDefault, bcrypt.genSaltSync(10))
                           console.debug(req.body)

                           req.locals.passwordDefault = passwordDefault
                           next()
                        }, err => next({ status: 500, description: err.message }))
        }
    ]
}