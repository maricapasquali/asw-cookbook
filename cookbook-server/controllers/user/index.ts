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
import {client_origin, server_origin} from "../../../modules/hosting/variables";

import {ResetPasswordEmail, SignUpEmail, TemplateEmail} from "../../modules/mailer/templates";
import * as path from "path";
import {ImageUploader} from "../../modules/image.uploader";

const app_name = require('../../../app.config.json').app_name

const tokensManager: IJwtToken = new JwtToken()
const accessManager: IRbac = new RBAC()
const mailer: IMailer = new Mailer(`no-reply@${app_name.toLowerCase()}.com`);

const imageUploader = new ImageUploader(path.resolve('cookbook-server/images'))
imageUploader.configuration = {
    newFileName: function (file: any){
        return randomString(30) + path.extname(file.originalname)
    }
}

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

export function uploadProfileImage(){
    return imageUploader.upload('img')
}

export function create_user(req, res){
    let userBody = {
        credential: { userID: req.body.userID, hash_password: req.body.hash_password },
        information: {}
    }
    delete req.body.userID
    delete req.body.hash_password
    userBody.information = req.body
    if(req.file) userBody.information['img'] = req.file.filename

    const new_user = new User(userBody)
    new_user.save()
        .then(user => {
            res.status(201).json({ userID: user._id })
            if(accessManager.isSignedUser(user.credential)) send_email_signup(user)
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
    User.findOne().where('signup').equals('checked').where("credential.userID").equals(nickname)
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
            user.save().then(u => {
                let isSigned = accessManager.isSignedUser(u.credential)? true: undefined
                let isAdmin = accessManager.isAdminUser(u.credential)? true: undefined
                res.status(200).json({
                    token: u.credential.tokens,
                    userInfo: {_id: u._id, userID: u.credential.userID, isSigned: isSigned, isAdmin: isAdmin},
                    firstLogin: firstLogin ? true: undefined})
                },
                err => res.status(500).json({description: err.message}))
        }
        else res.status(403).json({description: 'User is unauthorized'});
    }, err => res.status(500).json({description: err.message}))
}

//use token
export function check_authorization(req, res) {
    let {id} = req.params
    const {access_token} = extractAuthorization(req.headers)
    if(!access_token) return res.status(400).json({description: 'Missing authorization.'})
    let decoded_token = tokensManager.checkValidityOfToken(access_token);
    if(!decoded_token) return res.status(401).json({description: 'Token is expired. You request another.'})
    if(decoded_token._id === id) {
        User.findOne().where('signup').equals('checked').where('_id').equals(id).then(user => {
            if (user == null) return res.status(404).json({description: 'User is not found'});
            let isSigned = accessManager.isSignedUser(user.credential) ? true : undefined
            let isAdmin = accessManager.isAdminUser(user.credential) ? true : undefined
            return res.status(200).json({ isSigned: isSigned, isAdmin: isAdmin, description: 'You can access to this resource'})
        })
    }
    else return res.status(403).json({description: "You can't access to this resource"})
}

// (optional) use token
export function one_user(req, res){
    const {access_token} = extractAuthorization(req.headers)
    let {id} = req.params
    User.findOne().where('signup').equals('checked').where('_id').equals(id)
        .then(user => {
                if (user == null) return res.status(404).json({description: 'User is not found'});
                let isSigned = accessManager.isSignedUser(user.credential) ? true : undefined
                let isAdmin = accessManager.isAdminUser(user.credential) ? true : undefined
                var userO = user.toObject();
                let decoded_token = tokensManager.checkValidityOfToken(access_token)
                if(!access_token || !decoded_token || decoded_token._id !== id) {
                    delete userO.information.email;
                    delete userO.information.tel_number;
                }
                res.status(200).json({
                    information: userO.information,
                    userID: user.credential.userID,
                    isSigned: isSigned,
                    isAdmin: isAdmin,
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

    let authorized = accessManager.isAuthorized(decoded_token.role, RBAC.Operation.UPDATE, RBAC.Subject.USER, decoded_token._id !== id);
    if(!authorized) return res.status(403).send({description: 'User is unauthorized'})

    let userBody = req.body
    if(req.file) userBody.img = req.file.filename
    if(!userBody.img) userBody.img = undefined
    if(Object.keys(req.body).length === 0) return res.status(400).json({description: 'Missing body.'})
    console.log("Update info user = ", userBody)

    User.findOne().where('signup').equals('checked').where('_id').equals(id)
        .then(user =>{
                if (!user) return res.status(404).json({description: 'User is not found'});
                if(isAlreadyLoggedOut(user)) return res.status(401).send({description: 'User is not authenticated'})
                user.information = Object.assign(user.information , userBody)
                user.save().then((u) => res.status(200).json({update: true, info: u.information}), err => {
                    if(err.name === 'ValidationError') return res.status(400).json({description: err.message})
                    res.status(500).json({description: err.message})
                })
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


    let authorized = accessManager.isAuthorized(decoded_token.role, RBAC.Operation.DELETE, RBAC.Subject.USER, decoded_token._id !== id);
    if(!authorized) return res.status(403).send({description: 'User is unauthorized'})

    const deleteUser = (id, decoded_token) => {
        User.findOne().where('signup').equals('checked').where('_id').equals(id).then(user => {
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
    User.findOne().where('signup').equals('checked').where("_id").equals(id)
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
    let {change, reset} = req.query

    const {access_token} = extractAuthorization(req.headers)
    if(!access_token) return res.status(400).json({description: 'Missing authorization.'})

    if(!['userID', 'password'].includes(change)) return res.status(400).json({description: 'Available values: ["userID", "password"]'})

    let decoded_token = tokensManager.checkValidityOfToken(access_token);
    if(!decoded_token) return res.status(401).send({description: 'User is not authenticated'})

    let authorized = accessManager.isAuthorized(decoded_token.role, RBAC.Operation.UPDATE, RBAC.Subject.USER_CREDENTIAL, decoded_token._id !== id);
    if(!authorized) return res.status(403).send({description: 'User is unauthorized'})

    let {old_userID, new_userID, old_password, new_hash_password} = req.body

    switch (change){
        case 'userID':{
            if(!(old_userID && new_userID))
                return res.status(400).send({description: 'Update userID: required [old_userID, new_userID] '})

            User.findOne().where('signup').equals('checked').where('_id').equals(id).then(user => {
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
            if(!reset && !(old_password && new_hash_password))
                return res.status(400).send({description: 'Update password: required [old_password, new_hash_password] '})

            User.findOne().where('signup').equals('checked').where('_id').equals(id).then(user => {
                    if (!user) return res.status(404).json({description: 'User is not found'});
                    let result = reset || bcrypt.compareSync(old_password, user.credential.hash_password)
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

    let authorized = accessManager.isAuthorized(decoded_token.role, RBAC.Operation.DELETE, RBAC.Subject.SESSION, decoded_token._id !== id);
    if(!authorized) return res.status(403).send({description: 'User is unauthorized'})

    User.findOne().where('signup').equals('checked').where('_id').equals(id).then(user => {
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

    if(!access_token) return res.status(400).json({description: 'Missing access token'})
    if(!refresh_token) return res.status(400).json({description: 'Missing refresh token'})

    let decoded_aToken = tokensManager.checkValidityOfToken(access_token);
    if(decoded_aToken!==false) return res.status(409).send({description: 'Access token is still valid'})

    let decoded_rToken = tokensManager.checkValidityOfToken(refresh_token);
    if(!decoded_rToken)
        return res.status(401).send({description: 'Refresh token was expired. Please make a new signin request'})

    if(!accessManager.isAuthorized(decoded_rToken.role, RBAC.Operation.UPDATE, RBAC.Subject.SESSION, decoded_rToken._id !== id))
        return res.status(403).send({description: 'User is unauthorized to update session.'})

    User.findOne().where('signup').equals('checked').where('_id').equals(id).then(user => {
            if(!user) return res.status(404).json({description: 'User not found'})
            // TODO: found a way to use access token in db
            // let {access, refresh} = user.credential.tokens
            // if(!(access && refresh && tokensManager.areTheSame(access, access_token) && tokensManager.areTheSame(refresh, refresh_token)))
            //     return res.status(403).send({description: 'User is unauthorized'})
            let token = tokensManager.createToken({_id: user._id, userID: user.credential.userID, role: user.credential.role})

            user.credential.tokens = {
                access: token,
                refresh: refresh_token
            }
            console.log("create new access = ", token)
            user.save()
                .then(() => res.status(200).json({access_token: token}),
                    err => res.status(500).json({description: err.message}))
        },
        err=>res.status(500).json({description: err.message}))
}

export function checkLinkResetPassword(req, res){
    let {key} = req.query
    if(!key) return res.status(400).json({description: 'Missing key'})

    EmailLink.findOne()
             .where('link').equals(client_origin + '/reset-password')
             .where('randomKey').equals(key)
             .then(emailLink => {
                 if(!emailLink) return res.status(404).json({description: 'Key not valid'})
                 if(emailLink.expired < Date.now()) {
                     emailLink.delete()
                              .then(() => res.status(410).json({description: 'Link expired'}),
                                    err => res.status(500).json({description: err.message}))
                 }
                 else return res.status(200).json({description: 'Link valid'})
             }, err => res.status(500).json({description: err.message}))
}

export function foundUserForNickname(req, res){
    const {nickname} = req.query
    if(!nickname) return res.status(400).json({description: 'Missing nickname'})

    User.findOne()
        .where('credential.userID').equals(nickname)
        .where('signup').equals('checked')
        .then(user => {
            if(!user) return res.status(404).json({description: 'User is not found'});
            let token = tokensManager.createToken({_id: user._id, userID: user.credential.userID, role: user.credential.role}, "5 minutes")
            res.status(200).json({temporary_token: token, _id: user._id})
        }, err => res.status(500).json({description: err.message}))
}

//SEND EMAIL
export function send_email_password(req, res){
    let {email} = req.query
    if(!email) return res.status(400).json({description: 'Missing email.'})

    User.findOne().where('signup').equals('checked').where('information.email').equals(email).then(user => {
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
