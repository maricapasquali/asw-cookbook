import * as bcrypt from 'bcrypt'
import {
    extractAuthorization,
    futureDateFromNow,
    isAlreadyLoggedOut,
    randomString,
    unixTimestampToString
} from '../../modules/utilities'
import {User, EmailLink} from '../../models'

import {IJwtToken, JwtToken} from '../../modules/jwt.token'
import {IRbac, RBAC} from '../../modules/rbac'
import {Mailer, IMailer} from "../../modules/mailer";
import {client_origin} from "../../../modules/hosting/variables";

import {ResetPasswordEmail, SignUpEmail, TemplateEmail} from "../../modules/mailer/templates";

const app_name = require('../../../app.config.json').app_name

const tokensManager: IJwtToken = new JwtToken()
const accessManager: IRbac = new RBAC()
const mailer: IMailer = new Mailer(`no-reply@${app_name.toLowerCase()}.com`);

const send_email_signup = function (user) {
    let randomKey: string = randomString()
    let url: string = client_origin + '/end-signup'
    let emailLink = new EmailLink({
        userID: user.credential.userID,
        email: user.information.email,
        expired: futureDateFromNow(1440), //24 ore
        link: url,
        randomKey: randomKey
    })
    emailLink.save().then((_email_link) =>{

        const signUpEmail: TemplateEmail = new SignUpEmail({
            app_name: app_name,
            firstname: user.information.firstname,
            lastname: user.information.lastname,
            email: user.information.email,
            userID: user.credential.userID,
            url: url + '?key=' + randomKey + "&email=" + user.information.email+"&userID="+user.credential.userID
        })

        let html: string = signUpEmail.toHtml()
        let text: string = signUpEmail.toText()

        mailer.save(`signup-${user._id}.html`, html) //FOR DEVELOP
        mailer.send({
            to: user.information.email,
            subject: 'CookBook - Registazione',
            html: html,
            text: text
        })

    })

}

export function create_user(req, res){
    const new_user = new User(req.body);
    new_user.save()
        .then(user => {
            res.status(201).json({
                userID: user._id,
                description: "Riceverai un'email di verifica"
            })
            send_email_signup(user)
        }, err => {
            if(err.name === 'ValidationError')
                return res.status(400).json({description: err.message})
            if(err.code === 11000)
                return res.status(409).json({description: 'Username has been already used'})
            res.status(500).json({code: 0, description: err.message})
        })
}

export function check_account(req, res){
    let {email, userID, key} = req.body
    if(!email || !userID || !key) return res.status(400).json({description: "Require 'email', 'userID', 'key'"})
    EmailLink.findOne().where('randomKey').equals(key)
                       .where('email').equals(email)
                       .where('userID').equals(userID)
                       .then((email_link) =>{
                           if(!email_link) return res.status(404).json({description: 'Link not valid'})

                           User.findOne().where('credential.userID').equals(userID).then((user) =>{
                               if(!user) return res.status(404).json({description: 'User not found'})
                               if(user.signup === 'checked') return res.status(200).json({just_check_account: true})
                               if(user.signup === 'pending') {
                                   user.signup = 'checked'
                                   user.save()
                                       .then((u) => res.status(200).json({check_account: true}),
                                             (e) => res.status(500).json({check_account: false, description: e.message}))
                               }

                           })
                       })
}

export function all_users(req, res){
    const {nickname} = req.query

    let {page, limit} = req.query

    if(page && limit){
        page = +page
        limit = +limit
    }

    const query = nickname ? User.find().where('credential.userID').equals(nickname) : User.find()
    query.where('signup').equals('checked')
         .where('credential.role', 'signed')
         .select({information: 1, 'credential.userID': 1})
         .collation({'locale':'en'}) // sort case insensitive
         .sort({'credential.userID': 1})
         .limit(limit).skip((page-1)* limit)
         .then(users => {
             if(users.length === 0) return res.status(404).json({description: 'User is not found'});
             res.status(200).json(users)
         }, err => res.status(500).json({description: err.message}))
}

export function reset_password(req, res){
    const {nickname} = req.query
    const {hash_password} = req.body
    if(!nickname) return res.status(400).json({description: 'nickname is required'});
    if(!hash_password) return res.status(400).json({description: 'hash_password is required'});
    User.findOne().where("credential.userID").equals(nickname)
        .then(user => {
                if(user==null) return res.status(404).json({description: 'User is not found'});
                user.credential.hash_password = hash_password
                user.save().then(u => res.status(200).json({reset_password: true}),
                    err => res.status(500).json({description: err.message}))
            },
            err => res.status(500).json({description: err.message}))
}

export function login(req, res){
    const {userID, password} = extractAuthorization(req.headers)

    if(!userID && !password) return res.status(400).json({description: 'userID and password are required.'})
    if(!userID) return res.status(400).json({description: 'userID is required.'})
    if(!password) return res.status(400).json({description: 'password is required.'})

    User.findOne().where("credential.userID").equals(userID).then(user => {
        if(user==null) return res.status(404).json({description: 'User is not found'});
        if(user.signup === 'pending') return res.status(403).json({signup: user.signup, description: 'User yet to be verified'});
        const result = bcrypt.compareSync(password, user.credential.hash_password)
        if(result) {
            let firstLogin = accessManager.isAdminUser(user.credential) && user.credential.tokens === undefined
            user.credential.tokens = tokensManager.createNewTokens({_id: user._id, userID: user.credential.userID, role: user.credential.role})
            user.save().then(u => res.status(200).json({token: u.credential.tokens, firstLogin: firstLogin ? true: undefined}),
                err => res.status(500).json({description: err.message}))
        }
        else res.status(403).json({description: 'User is unauthorized'});
    }, err => res.status(500).json({description: err.message}))
}

export function one_user(req, res){
    let {id} = req.params
    User.findOne().where('_id').equals(id)
        .then(user => {
                if (user == null) return res.status(404).json({description: 'User is not found'});
                res.status(200).json({
                    information: user.information,
                    userID: user.credential.userID,
                    _id: user._id
                });
            },
            err => res.status(500).json({description: err.message}))
}

//use token
export function update_user(req, res){
    let {id} = req.params

    const {access_token} = extractAuthorization(req.headers)
    if(!access_token) return res.status(400).json({description: 'Missing authorization.'})

    let decoded_token = tokensManager.checkValidityOfToken(access_token);
    if(!decoded_token) return res.status(401).send({description: 'User is not authenticated'})

    let authorized = accessManager.isAuthorized(decoded_token, id, RBAC.Operation.UPDATE, 'user');
    if(!authorized) return res.status(403).send({description: 'User is unauthorized'})

    User.findOne().where('_id').equals(id)
        .then(user =>{
                if (!user) return res.status(404).json({description: 'User is not found'});
                if(isAlreadyLoggedOut(user)) return res.status(401).send({description: 'User is not authenticated'})
                user.information = Object.assign( user.information , req.body)
                user.save().then(() => res.status(200).json({update: true}), err => res.status(500).json({description: err.message}))
            },
            err => res.status(500).json({description: err.message}))
}

//use token
export function delete_user(req, res){

    let {id} = req.params
    const {access_token} = extractAuthorization(req.headers)
    if(!access_token) return res.status(400).json({description: 'Missing authorization.'})

    let decoded_token = tokensManager.checkValidityOfToken(access_token);
    if(!decoded_token) return res.status(401).send({description: 'User is not authenticated'})


    let authorized = accessManager.isAuthorized(decoded_token, id, RBAC.Operation.DELETE, 'user');
    if(!authorized) return res.status(403).send({description: 'User is unauthorized'})

    const deleteUser = (id, decoded_token) => {
        User.findOne().where('_id').equals(id).then(user => {
            if(!user) return res.status(404).json({description: 'User not found'})
            if(accessManager.isSignedUser(decoded_token) && isAlreadyLoggedOut(user))
                return res.status(401).send({description: 'User is not authenticated'})
            //res.status(200).json({delete: user})
            user.remove().then(() => res.status(200).json({delete: true}),
                err => res.status(500).json({description: err.message}))
        }, err => res.status(500).json({description: err.message}))
    }

    if(accessManager.isAdminUser(decoded_token)){
        User.findOne().where('_id').equals(decoded_token._id).then(admin => {
            if (isAlreadyLoggedOut(admin)) return res.status(401).send({description: 'User is not authenticated'})
            deleteUser(id, decoded_token)
        })
    }else deleteUser(id, decoded_token)
}

export function state_user(req, res){
    let {id} = req.params
    User.findOne().where("_id").equals(id)
        .then(user => {
                if (!user) return res.status(404).json({description: 'User is not found'});
                res.status(200).json({
                    online: typeof user.credential.tokens === 'object',
                    // lastTimeLogin: typeof user.credential.tokens === 'number' ? new Date(user.credential.tokens).toLocaleString(): undefined
                    lastTimeLogin: typeof user.credential.tokens === 'number' ? unixTimestampToString(user.credential.tokens): undefined
                });

            },
            err => res.status(500).json({description: err.message}))
}

//use token
export function update_credential_user(req, res){
    let {id} = req.params
    let {change} = req.query

    const {access_token} = extractAuthorization(req.headers)
    if(!access_token) return res.status(400).json({description: 'Missing authorization.'})

    if(!['userID', 'password'].includes(change)) return res.status(400).json({description: 'Available values: ["userID", "password"]'})

    let decoded_token = tokensManager.checkValidityOfToken(access_token);
    if(!decoded_token) return res.status(401).send({description: 'User is not authenticated'})

    let authorized = accessManager.isAuthorized(decoded_token, id, RBAC.Operation.UPDATE, 'user_credential');
    if(!authorized) return res.status(403).send({description: 'User is unauthorized'})

    let {old_userID, new_userID, old_password, new_hash_password} = req.body

    switch (change){
        case 'userID':{
            if(!(old_userID && new_userID))
                return res.status(400).send({description: 'Update userID: required [old_userID, new_userID] '})

            User.findOne().where('_id').equals(id).then(user => {
                    if (!user) return res.status(404).json({description: 'User is not found'});
                    if(user.credential.userID === old_userID) {
                        user.credential.userID = new_userID
                        user.save().then(() => res.status(200).json({update: change}),
                            err => res.status(500).json({description: err.message}))
                    }else return res.status(400).json({description: 'Old UserID is incorrect'});
                },
                err => res.status(500).json({description: err.message}))

        }break;
        case 'password':{
            if(!(old_password && new_hash_password))
                return res.status(400).send({description: 'Update password: required [old_password, new_hash_password] '})

            User.findOne().where('_id').equals(id).then(user => {
                    if (!user) return res.status(404).json({description: 'User is not found'});
                    let result = bcrypt.compareSync(old_password, user.credential.hash_password)
                    if(result) {
                        user.credential.hash_password = new_hash_password
                        user.save().then(() => res.status(200).json({update: change}),
                            err => res.status(500).json({description: err.message}))
                    }else return res.status(400).json({description: 'Old Password is incorrect'});
                },
                err => res.status(500).json({description: err.message}))

        }break
    }
}

//use token
export function logout(req, res){
    let {id} = req.params
    const {access_token} = extractAuthorization(req.headers)
    if(!access_token) return res.status(400).json({description: 'Missing authorization.'})

    let decoded_token = tokensManager.checkValidityOfToken(access_token);
    if(!decoded_token) return res.status(401).send({description: 'User is not authenticated'})

    let authorized = accessManager.isAuthorized(decoded_token, id, RBAC.Operation.DELETE, 'session');
    if(!authorized) return res.status(403).send({description: 'User is unauthorized'})

    User.findOne().where('_id').equals(id).then(user => {
        if(!user) return res.status(404).json({description: 'User not found'})
        if(isAlreadyLoggedOut(user)) return res.status(409).json({ description: 'User is already logged out' })

        user.credential.tokens = Date.now()
        user.save().then(() => res.status(200).json({logout: true}), err => res.status(500).send({description: err.message}))
    }, err => res.status(500).json({description: err.message}))
}

//use token
export function update_access_token(req, res){
    let { id } = req.params
    let { refresh_token } = req.body
    let { access_token } = extractAuthorization(req.headers)

    if(!refresh_token) return res.status(400).json({description: 'Missing refresh token'})

    let decoded_aToken = tokensManager.checkValidityOfToken(access_token);
    if(decoded_aToken!==false) return res.status(409).send({description: 'Access token is still valid'})

    let decoded_rToken = tokensManager.checkValidityOfToken(refresh_token);
    if(!decoded_rToken)
        return res.status(401).send({description: 'Refresh token was expired. Please make a new signin request'})

    if(!accessManager.isAuthorized(decoded_rToken, id, RBAC.Operation.UPDATE, 'session'))
        return res.status(403).send({description: 'User is unauthorized'})

    User.findOne().where('_id').equals(id).then(user => {
            if(!user) return res.status(404).json({description: 'User not found'})
            let {access, refresh} = user.credential.tokens
            if(!(access && refresh && tokensManager.areTheSame(access, access_token) && tokensManager.areTheSame(refresh, refresh_token)))
                return res.status(403).send({description: 'User is unauthorized'})
            let token = tokensManager.createNewTokens({_id: user._id, userID: user.credential.userID, role: user.credential.role})

            user.credential.tokens.access = token
            user.save()
                .then(u => res.status(200).json({access_token: token.access}),
                    err => res.status(500).json({description: err.message}))
        },
        err=>res.status(500).json({description: err.message}))

}


//SEND EMAIL
export function send_email_password(req, res){
    let {email} = req.query
    if(!email) return res.status(400).json({description: 'Missing email.'})

    User.findOne().where('information.email').equals(email).then(user => {
        if(!user) return res.status(404).json({description: 'Email is not associated with any account'});

        let randomKey: string = randomString()
        let url: string = client_origin + '/reset-password'

        let emailLink = new EmailLink({
            email: email,
            expired: futureDateFromNow(30),
            link: url,
            randomKey: randomKey
        })
        emailLink.save()
                 .then((_emailLink) => {
                    res.status(200).json({send: true});

                    const resetPswEmail: TemplateEmail = new ResetPasswordEmail({
                        app_name: app_name,
                        user_name: user.information.firstname + ' '+user.information.lastname,
                        url: url + '?key=' + randomKey
                    })

                    let html: string = resetPswEmail.toHtml()
                    let text: string = resetPswEmail.toText()

                    mailer.save(`reset-pass-${user._id}.html`, html) //FOR DEVELOP

                    mailer.send({
                        to: email,
                        subject: 'CookBook - Reset Password',
                        html: html,
                        text: text
                    })
                }, err => res.status(500).json({description: err.message}))
    })
}
