const assert = require('assert');
const bcrypt = require('bcrypt');
const {Types} = require("mongoose")
const ObjectId = Types.ObjectId

const {connect, disconnect, dropDatabase} = require('../database')
const {create_notification} = require("../controllers/notification")
const {Notification} = require("../models/schemas/notification")
const {User} = require("../models");

describe('Notification', function (){

    const kyle = {
        _id: ObjectId("623b9fd54a142c245c6de540"),
        information: {
            firstname: "kyle",
            lastname: "smith",
            email: "kyle@gmail.com"
        },
        credential: {
            userID: "Kyle066",
            hash_password: bcrypt.hashSync("password", 10)
        },
        signup: "checked"
    }
    const marica = {
        _id: ObjectId("623b9fd54a142c245c6de541"),
        information: {
            firstname: "marica",
            lastname: "pasquali",
            email: "pasquali@gmail.com"
        },
        credential: {
            userID: "maricapasquali",
            hash_password: bcrypt.hashSync("password", 10)
        },
        signup: "checked"
    }
    const kira = {
        _id: ObjectId("623b9fd54a142c245c6de542"),
        information: {
            firstname: "kira",
            lastname: "green",
            email: "green@gmail.com"
        },
        credential: {
            userID: "kira01",
            hash_password: bcrypt.hashSync("password", 10)
        },
        signup: "checked"
    }

    this.timeout(100000)

    before(() => connect().then(() => User.insertMany([kyle, marica, kira])))
    after(() => dropDatabase().then(() => disconnect()));


    it('not valid.', function (done){

        create_notification({
            user: '614c308bc2d03660623a59e2',
            content: 'Kyle066 ha inserito un nuovo alimento: Papaya.'
        }).then(done, err => {
            assert(err.code === 400 || err.code === 404)
            done()
        }).catch(done)

    })

    it('valid.', function (done){

        create_notification({
            user: kyle._id,
            type: Notification.Type.USER_INFO,
            content: 'Le informazioni del tuo account sono cambiate.'
        }).then(result => {
            assert.ok(result)
            done()
        }, done).catch(done)

    })

    it('valid with some info.', function (done){

        create_notification({
            user: "admin",
            type: Notification.Type.REPORT,
            content: 'maricapasquali ha segnato il commento di \'kira\' nella ricetta \'Chocolate Cookie\'',
            otherInfo: {
                recipe: {_id: ObjectId('61a8a102045443d03b27224a')},
                commentID: {_id: ObjectId('61a8a102045443d03b27224b')},
                reporter: marica._id,
                reported: kira._id,
            }
        }).then(result => {
            assert.ok(result)
            done()
        }, done).catch(done)

    })

    describe('User', function (){

        it('is not found.', function (done){
            create_notification({
                user: '614c308bc2d03660623a59e1',
                type: Notification.Type.FRIENDSHIP,
                content: 'mario088 ha accettato la tua richiesta di amicizia.'
            }).then(done, err =>{
                assert(err.code === 404)
                done()
            }).catch(done)
        })

        it('is not valid.', function (done){
            create_notification({
                user: '',
                type: Notification.Type.REPORT,
                content: 'Kyle ha segnato il commento di Hanna nella ricetta Chocolate Cookie'
            }).then(done, err =>{
                assert(err.code === 400)
                done()
            }).catch(done)
        })

    })

})