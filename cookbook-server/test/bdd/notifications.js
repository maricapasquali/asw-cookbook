const assert = require('assert');
const {create_notification} = require("../../controllers/notification")
const {Notification} = require("../../models/schemas/notification")

const {
    TIMEOUT_DATABASE,
    isTestingMode,
    ObjectId,
    connectDatabase,
    disconnectDatabase,
    dropDatabase
} = require("../helpers")
const {
    kira,
    kyle,
    marica,
    insertSomeUsers,
} = require("../helpers/notification.helpers")

describe('Notification', function (){

    this.timeout(TIMEOUT_DATABASE)

    before(function () {
        if(!isTestingMode) {
            console.log("All Tests ignored..")
            this.skip()
        }
        return connectDatabase().then(() => insertSomeUsers())
    })

    after(() => {
        if(isTestingMode) return dropDatabase().then(() => disconnectDatabase())
    });

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
                recipe: {_id: ObjectId() },
                commentID: {_id: ObjectId() },
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