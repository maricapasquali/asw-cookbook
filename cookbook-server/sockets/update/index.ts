import {SignUp} from "../../models/schemas/user";
import {User} from "../../models";
import Rooms from "../rooms";
import {userInformation} from "../rooms/user";

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
                    socket.to(Rooms.ADMINS).emit('user:signup', user)
                    if(SignUp.State.isChecked(_user.signup)) socket.broadcast.except(Rooms.ADMINS).emit('user:checked', user)
                } else console.error('User is not found.')
            }, err => console.error(err))
    })
    socket.on('user:update:info', useInformation => socket.broadcast.emit('user:update:info', useInformation))
    socket.on('user:delete', _id => socket.broadcast.emit('user:delete', _id))

    //RECIPE PERMISSION
    socket.on('recipe:add:permission', recipe => io.to(recipe?.permission?.map(p => p.user._id)).emit('recipe:add:permission', {recipe}))

    //FOOD
    socket.on('food:update', food => socket.broadcast.emit('food:update', food))

    //LIKE
    socket.on('unlike:recipe', (recipeID, likeID) => socket.broadcast.emit('unlike:recipe', {recipeID, likeID}))
    socket.on('unlike:comment', (commentID, likeID) => socket.broadcast.emit('unlike:comment', {commentID, likeID}))

    //COMMENT
    socket.on('comment:update', comment => socket.broadcast.emit('comment:update', comment))
    socket.on('comment:delete', commentID => socket.broadcast.emit('comment:delete', commentID))
    socket.on('comment:unreport', commentID => socket.broadcast.emit('comment:unreport', commentID))

    //SHOPPING LIST
    socket.on('shopping-list:add', point => {
        let {id} = userInformation(socket)
        socket.to(id).emit('shopping-list:add', point)
    })
    socket.on('shopping-list:update', point => {
        let {id} = userInformation(socket)
        socket.to(id).emit('shopping-list:update', point)
    })
    socket.on('shopping-list:remove', pointID => {
        let {id} = userInformation(socket)
        socket.to(id).emit('shopping-list:remove', pointID)
    })
}
