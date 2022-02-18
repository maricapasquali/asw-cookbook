import {findAdminSocketIDs} from "../users";
import {SignUp} from "../../models/schemas/user";
import {User} from "../../models";

export default function (io: any, socket: any): void {
    //USER
    socket.on('user:signup', _id => {
        User.findOne()
            .where('_id').equals(_id)
            .then(_user => {
                if(_user){

                    const user = { userID: _user.credential.userID, role: _user.credential.role, ...(_user.toObject()) }
                    delete _user.credential
                    delete user.credential

                    const admins = findAdminSocketIDs()
                    if(admins.length) socket.to(admins).emit('user:signup', user)

                    if(SignUp.State.isChecked(_user.signup)) socket.broadcast.except(admins).emit('user:checked', user)

                } else console.error('User is not found.')
            }, err => console.error(err))
    })
    socket.on('user:update:info', useInformation => socket.broadcast.emit('user:update:info', useInformation))
    socket.on('user:delete', _id => socket.broadcast.emit('user:delete', _id))

    //FOOD
    socket.on('food:update', food => socket.broadcast.emit('food:update', food))

    //LIKE
    socket.on('unlike:recipe', (recipeID, likeID) => socket.broadcast.emit('unlike:recipe', {recipeID, likeID}))
    socket.on('unlike:comment', (commentID, likeID) => socket.broadcast.emit('unlike:comment', {commentID, likeID}))

    //COMMENT
    socket.on('comment:update', comment => socket.broadcast.emit('comment:update', comment))
    socket.on('comment:delete', commentID => socket.broadcast.emit('comment:delete', commentID))
    socket.on('comment:unreport', commentID => socket.broadcast.emit('comment:unreport', commentID))
}