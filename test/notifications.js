const assert = require('assert');

const {connect, disconnect} = require('../cookbook-server/database')
const {create_notification} = require("../cookbook-server/controllers/notification")
const {Notification} = require("../cookbook-server/models/schemas/notification")

describe('Notification', function (){
    before(connect)
    after(disconnect)

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
            user: '614c308bc2d03660623a59e2',
            type: Notification.Type.USER_INFO,
            content: 'Le informazioni del tuo account sono cambiate.'
        }).then(result => {
            assert.ok(result)
            done()
        }, done).catch(done)

    })

    it('valid with some info.', function (done){

        create_notification({
            user: '61a8f8b04b42e70be03df4b3', // id admin
            type: Notification.Type.REPORT,
            content: 'maricapasquali ha segnato il commento di \'kira\' nella ricetta \'Chocolate Cookie\'',
            otherInfo: {
                reporterUser: '614c308bc2d03660623a59e2',
                commentID: '61a8a102045443d03b27224a'
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