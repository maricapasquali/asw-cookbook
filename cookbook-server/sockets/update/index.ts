import {findAdminSocketIDs, getSocketIDs} from "../user";
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

                    if(SignUp.State.isChecked(_user.signup)) {
                        const otherConnectedUsers = getSocketIDs(admins)
                        if(otherConnectedUsers.length) socket.to(otherConnectedUsers).emit('user:checked', user)
                    }

                } else console.error('User is not found.')
            }, err => console.error(err))
    })
    socket.on('user:update:info', useInformation => socket.to(getSocketIDs()).emit('user:update:info', useInformation))
    socket.on('user:delete', _id => socket.to(getSocketIDs()).emit('user:delete', _id))

    //FOOD
    socket.on('food:update', food => socket.to(getSocketIDs()).emit('food:update', food))

    //LIKE
    socket.on('unlike:recipe', (recipeID, likeID) => socket.to(getSocketIDs()).emit('unlike:recipe', {recipeID, likeID}))
    socket.on('unlike:comment', (commentID, likeID) => socket.to(getSocketIDs()).emit('unlike:comment', {commentID, likeID}))

    //COMMENT
    socket.on('comment:update', comment => socket.to(getSocketIDs()).emit('comment:update', comment))
    socket.on('comment:delete', commentID => socket.to(getSocketIDs()).emit('comment:delete', commentID))
    socket.on('comment:unreport', commentID => socket.to(getSocketIDs()).emit('comment:unreport', commentID))
}