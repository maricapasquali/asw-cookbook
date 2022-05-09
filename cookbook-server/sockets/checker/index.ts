import {User} from "../../models";
import {userInformation, UserInformationType} from "../rooms/user";
import * as bcrypt from 'bcrypt'

export default function (io: any, socket: any): void {

    socket.on('check:old-password', (oldPassword: string) => {
        let userInfo: UserInformationType = userInformation(socket)
        User.findOne()
            .where('_id').equals(userInfo.id)
            .select("credential.hash_password")
            .then(user => {
                bcrypt.compare(oldPassword, user.credential.hash_password)
                      .then(result => {
                          console.debug("password is corrent  ", result);
                          socket.emit('check:old-password:result', result)
                      })
                      .catch(err => {
                          console.error('Error in check old password : ', err);
                          socket.emit('check:old-password:result', false)
                      })
            }, console.error)
    })

}