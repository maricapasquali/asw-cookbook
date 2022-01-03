import * as bcrypt from 'bcrypt'
import {futureDateFromNow, randomString} from '../../modules/utilities'
import {EmailLink, Friend, Notification, ShoppingList, User} from '../../models'

import {DecodedTokenType} from '../../modules/jwt.token'
import {RBAC} from '../../modules/rbac'
import {IMailer, Mailer} from "../../modules/mailer";
import {client_origin} from "../../../modules/hosting/variables";
import {IUser, SignUp} from "../../models/schemas/user";
import isAlreadyLoggedOut = IUser.isAlreadyLoggedOut;
import {
    accessManager,
    FileConfigurationImage,
    fileUploader,
    getRestrictedUser,
    getUser,
    pagination,
    tokensManager
} from "../index";

import {EraseUserEmail, ResetPasswordEmail, SignUpEmail, TemplateEmail} from "../../modules/mailer/templates";
import * as path from "path";
import Role = RBAC.Role;
import Operation = RBAC.Operation;
import Subject = RBAC.Subject;
import {Types} from "mongoose";
import ObjectId = Types.ObjectId
import {EmailValidator} from "../../../modules/validator";

const app_name = require('../../../app.config.json').app_name

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

    }, err => console.error(err.message))

}

export function uploadProfileImage(){
    let config = {...FileConfigurationImage, ...{
            newFileName: function (file: any){
                return randomString(30) + path.extname(file.originalname)
            }
        }}
    return fileUploader.single('img', config)
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

function infoUsers(users: Array<IUser>, me: DecodedTokenType): Array<object> {
    let usersObject = users.map(u => u.toObject())
    if(accessManager.isAdminUser(me)){
        console.debug('like admin')
        return usersObject.map(u => {
            let userInfo = {userID: u.credential.userID, role: u.credential.role}
            delete u.credential
            return {...u, ...userInfo}
        })
    }
    else {
        console.debug('like '+(me ? 'signed': 'anonymous'))
        return usersObject.map(u => {
            let userInfo = {userID: u.credential.userID, role: u.credential.role}
            delete u.credential
            delete u.strike
            return {...u, ...userInfo}
        })
    }
}
export function all_users(req, res){

    let {fullname, userID, page, limit} = req.query

    const searchAvailableValue = ['full', 'partial']

    let filters = { 'credential.role': Role.SIGNED }

    if(userID) {
        try {
            userID = JSON.parse(userID)
            if(!userID.search || !userID.value) throw new Error()
        } catch (e) {
            return res.status(400).json({ description: 'Parameter \'userID\' is malformed. It must be of form: {"search": string, "value": string}' })
        }

        if(!searchAvailableValue.includes(userID.search)) return res.status(400).json({ description: `Parameter \'userID.search\' must be in ${searchAvailableValue}.` })
        let regexObject = {$regex: `^${userID.value}`, $options: "i"}
        if(userID.search === 'full') regexObject['$regex']+='$'
        filters['credential.userID'] = regexObject
    }

    if(fullname) {
        try {
            fullname = JSON.parse(fullname)
            if(!fullname.search || !fullname.value) throw new Error()
        } catch (e) {
            return res.status(400).json({ description: 'Parameter \'fullname\' is malformed.  It must be of form: {"search": string, "value": string}' })
        }

        if(!searchAvailableValue.includes(fullname.search)) return res.status(400).json({ description: `Parameter \'fullname.search\' must be in ${searchAvailableValue}.`  })
        let regexObject = {$regex: `^${fullname.value}`, $options: "i"}
        if(fullname.search === 'full') regexObject['$regex']+='$'
        filters['$or'] = [ { 'information.firstname': regexObject  },  { 'information.lastname': regexObject } ]
    }

    getUser(req, res)
        .then(user => {

            if(!accessManager.isAdminUser(user)) filters['signup'] = SignUp.State.CHECKED

            if(user) filters['_id'] = {$ne: user._id}
            console.debug(JSON.stringify(filters, null, 2))

            pagination(
                User.find(filters).collation({'locale':'en'}  /* sort case insensitive*/ ).sort({'credential.userID': 1}),
                page && limit ? {page: +page, limit: +limit}: undefined
            )
            .then(result => res.status(200).json(Object.assign(result, {items: infoUsers(result.items as Array<IUser>, user)})),
                  err => res.status(500).json({description: err.message}))

        }, err => console.error(err))
}

export function check_account(req, res) {
    let {email, userID, key} = req.body
    if(!email || !userID || !key) return res.status(400).json({description: "Require 'email', 'userID', 'key'"})
    EmailLink.findOne()
            .where('randomKey').equals(key)
            .where('email').equals(email)
            .where('userID').equals(userID)
            .then((email_link) =>{
                if(!email_link) return res.status(404).json({description: 'Link not valid'})

                User.findOne()
                    .where('credential.userID').equals(userID)
                    .then((user) =>{
                        if(!user) return res.status(404).json({description: 'User not found'})
                        if(SignUp.State.isChecked(user.signup)) return res.status(200).json({just_check_account: true})
                        if(SignUp.State.isPending(user.signup)) {
                            user.signup = SignUp.State.CHECKED
                            user.save()
                                .then((u) => res.status(200).json({ _id: user._id, check_account: true}),
                                    (e) => res.status(500).json({check_account: false, description: e.message}))
                        }
                    }, err => res.status(500).json({description: err.message}))
            }, err => res.status(500).json({description: err.message}))
}

// (optional) use token
export function one_user(req, res){
    const {id} = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    getUser(req, res)
        .then(decoded_token => {

            User.findOne()
                .where('signup').equals(SignUp.State.CHECKED)
                .where('_id').equals(id)
                .then(user => {
                        if (!user) return res.status(404).json({description: 'User is not found'});
                        let isSigned = accessManager.isSignedUser(user.credential) ? true : undefined
                        let isAdmin = accessManager.isAdminUser(user.credential) ? true : undefined
                        var userO = user.toObject();
                        if(!decoded_token || decoded_token._id !== id) {
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
                    },err => res.status(500).json({description: err.message}))

        }, err => console.error(err))

}

//use token
export function update_user(req, res){
    let {id} = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    const decoded_token = getRestrictedUser(req, res, {
        operation: Operation.UPDATE,
        subject: Subject.USER,
        others: decodedToken => decodedToken._id !== id
    })
    if(decoded_token) {
        let userBody = req.body
        if(req.file) userBody.img = req.file.filename
        if(!userBody.img) userBody.img = undefined
        if(Object.keys(req.body).length === 0) return res.status(400).json({description: 'Missing body.'})
        console.log("Update info user = ", userBody)

        User.findOne()
            .where('signup').equals(SignUp.State.CHECKED)
            .where('_id').equals(id)
            .then(user =>{
                if (!user) return res.status(404).json({description: 'User is not found'});
                if(isAlreadyLoggedOut(user)) return res.status(401).send({description: 'User is not authenticated'})
                user.information = Object.assign(user.information , userBody)
                user.save()
                    .then((u) => res.status(200).json({update: true, info: u.information}),
                         err => {
                            if(err.name === 'ValidationError') return res.status(400).json({description: err.message})
                            return res.status(500).json({description: err.message})
                    })
            }, err => res.status(500).json({description: err.message}))
    }
}

function deleteUserRef(user: IUser): void {
    const userID: string = user.credential.userID
    ShoppingList.deleteOne()
                .where('user').equals(user._id)
                .then(result => console.log('Delete shopping list of user ', userID, ' : ', result),
                      err => console.error('Delete shopping list of user ', userID, ' : ', err))

    Notification.deleteMany()
                .where('user').in([user._id, user._id.toString()])
                .then(result => console.log('Delete notifications of user ', userID, ' : ', result),
                    err => console.error('Delete notifications of user ', userID, ' : ', err))

    Friend.deleteMany({ $or: [{ from: {$eq: user._id} }, { to: {$eq: user._id} }] })
          .where('user').in([user._id, user._id.toString()])
          .then(result => console.log('Delete friendships of user ', userID, ' : ', result),
                err => console.error('Delete friendships of user ', userID, ' : ', err))
}
function send_email_erase_user(user: IUser): void {
    const eraseUserEmail: TemplateEmail = new EraseUserEmail({
        app_name: app_name,
        firstname: user.information.firstname,
        lastname: user.information.lastname,
        userID: user.credential.userID,
        email: user.information.email
    })

    let html: string = eraseUserEmail.toHtml()
    let text: string = eraseUserEmail.toText()

    mailer.save(`erase-user-${user._id}.html`, html) //FOR DEVELOP

    mailer.send({
        to: user.information.email,
        subject: 'CookBook - Cancellazione account',
        html: html,
        text: text
    })
}
//use token
export function delete_user(req, res){
    let {id} = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    const decoded_token = getRestrictedUser(req, res, {
        operation: Operation.DELETE,
        subject: Subject.USER,
        others: decodedToken => decodedToken._id !== id
    })
    if(decoded_token) {

        const deleteUser = (id, decoded_token) => {
            let query =  User.findOne()
                             .where('_id').equals(id)

            if(!accessManager.isAdminUser(decoded_token)) query.where('signup').equals(SignUp.State.CHECKED)

            query
                .then(user => {
                    if(!user) return res.status(404).json({description: 'User not found'})
                    if(accessManager.isSignedUser(decoded_token) && isAlreadyLoggedOut(user))
                        return res.status(401).send({description: 'User is not authenticated'})
                    user.remove()
                        .then(_user => {
                            res.status(200).json({delete: true})
                            send_email_erase_user(_user)
                            deleteUserRef(_user)
                        }, err => res.status(500).json({description: err.message}))
                }, err => res.status(500).json({description: err.message}))
        }

        if(accessManager.isAdminUser(decoded_token)){
            User.findOne()
                .where('credential.role').equals(Role.ADMIN)
                .where('_id').equals(decoded_token._id)
                .then(admin => {
                    if (isAlreadyLoggedOut(admin)) return res.status(401).send({description: 'User is not authenticated'})
                    return deleteUser(id, decoded_token)
                }, err => res.status(500).json({description: err.message}))
        } else deleteUser(id, decoded_token)
    }
}

//use token
export function update_credential_user(req, res){
    let {id} = req.params
    if(!ObjectId.isValid(id)) return res.status(400).json({ description: 'Required a valid \'id\''})
    let {change, reset} = req.query

    const decoded_token = getRestrictedUser(req, res, {
        operation: Operation.UPDATE,
        subject: Subject.USER_CREDENTIAL,
        others: decodedToken => decodedToken._id !== id
    })

    if(decoded_token) {

        if(!['userID', 'password'].includes(change)) return res.status(400).json({description: 'Available values: ["userID", "password"]'})

        const {old_userID, new_userID, old_password, new_hash_password} = req.body

        switch (change){
            case 'userID':{
                if(!(old_userID && new_userID))
                    return res.status(400).send({description: 'Update userID: required [old_userID, new_userID] '})

                User.findOne().where('signup').equals(SignUp.State.CHECKED).where('_id').equals(id).then(user => {
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

                User.findOne().where('signup').equals(SignUp.State.CHECKED).where('_id').equals(id).then(user => {
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
        .where('signup').equals(SignUp.State.CHECKED)
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
    if(!EmailValidator.check(email)) return res.status(400).json({description: 'Email is not valid.'})

    User.findOne()
        .where('signup').equals(SignUp.State.CHECKED)
        .where('information.email').equals(email)
        .then(user => {
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
        }, err => res.status(500).json({description: err.message}))
}
