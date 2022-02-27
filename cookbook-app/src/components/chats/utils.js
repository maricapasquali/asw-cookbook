import * as _ from 'lodash'
import Server from "@api/server.info";

export function _lastAccess(chatType, users){
    let _lastAccess = '';
    if(chatType === 'one' && users.length === 2){
        const otherUser =  users.find(r => r.user?._id !== this.userIdentifier)
        _lastAccess = otherUser && otherUser.user?.lastAccess

        console.debug('Other user => ', otherUser.user?.userID,' Last access = ', _lastAccess)
    }
    else {
        const otherUsers = users.filter(r => r.user?._id !== this.userIdentifier)
        const _maxItem = _.maxBy(otherUsers.map(r => r.user), 'lastAccess')
        _lastAccess = otherUsers.every(r=> r.user?.lastAccess !== 0) ? _maxItem && _maxItem.lastAccess : 0

        const otherUsersLastAccess = otherUsers.map(r => { const obj = {}; obj[r.user?.userID] = r.user?.lastAccess || false; return obj })
        console.debug('Other users => ', JSON.stringify(otherUsersLastAccess), ' Last access = ', _lastAccess)
    }
    return _lastAccess
}

export function _baseInfoUser(chatInfo, users) {
    if (chatInfo.type === 'one' && users.length === 2) {
        const otherUser = users.find(r => r.user?._id !== this.userIdentifier)
        if (otherUser) console.debug('Other user: base info = ', JSON.stringify(otherUser.user))
        return otherUser && {_id: otherUser.user?._id, name: otherUser.user.userID, img: otherUser.user.img}
    }
    else {
        if(chatInfo.type === 'group' && this.isAdmin) {
            const otherUser = users.find(r => r.user.role !== 'admin')
            return otherUser && {_id: otherUser.user?._id, name: otherUser.user?.userID}
        }
        return {
            _id: users.filter(r => r.user?._id !== this.userIdentifier).map(r => r.user?._id),
            name: chatInfo.name,
            img: chatInfo.img
        }
    }
}

export function _isChatOne(chatInfo){
    return chatInfo.type === 'one'
}

export function _isChatGroup(chatInfo){
    return chatInfo.type === 'group'
}

export function _withAdmin(users){
    return users.some(r => r.user?.role === 'admin')
}

export function _goToChat(user_id, callbackCreateChat) {
    console.log('GO TO CHAT OF USER =', user_id)
    const formData = new FormData()
    if(user_id === 'admin') {
        formData.set('users', JSON.stringify([{user: user_id, role: 'admin'}]))
        formData.set('type', 'group')
        formData.set('name', 'Talk with Administrators')
    }else {
        formData.set('users', JSON.stringify([{user: user_id}]))
        formData.set('type', 'one')
    }
    const link = (chat_id) => ({ name: 'chat', params: { chat_id } })

    this.$store.dispatch('chats/create', formData)
        .then(({data}) => {
            if(isCallable(callbackCreateChat)) callbackCreateChat(data)
            this.$router.push(link(data._id))
        })
        .catch(err => {
            if(err.response && err.response.status === 409){
                const {chatID} = err.response.data
                console.debug('existed chat = ', chatID)
                this.$router.push(link(chatID))
            }
            //TODO: HANDLER ERROR CREATE CHAT
            else console.error(err)
        })
}

/* Listeners updates */
export function _onUpdateUserInfos(user, newInfos){
    if(user && newInfos){
        if(newInfos.information) user.img = newInfos.information.img ? Server.images.path(newInfos.information.img) : ''
        if(newInfos.userID) user.userID = newInfos.userID
    }
}
export function _onUpdateUserInOneChat(chat, userInfo){
    const foundUserInChat = chat.users.find(r => r.user?._id === userInfo._id)
    this._onUpdateUserInfos(foundUserInChat && foundUserInChat.user, userInfo)
    chat.messages.filter(m => m.sender && m.sender._id === userInfo._id)
        .forEach(m => this._onUpdateUserInfos(m.sender, userInfo))
}

export function onUpdateUserInOneChat(userInfo){
    if(this.chat && userInfo) this._onUpdateUserInOneChat(this.chat, userInfo)
}

export function onUpdateUserInChatSection(userInfo){
    if(userInfo){
        if(this.chats.length) this.chats.forEach(chat => this._onUpdateUserInOneChat(chat, userInfo))
        if(this.friends.length) {
            const foundUserFriend = this.friends.find(f => f.user?._id === userInfo._id)
            this._onUpdateUserInfos(foundUserFriend && foundUserFriend.user, userInfo)
        }
    }
}

export default {
    _lastAccess,
    _baseInfoUser,
    _isChatOne,
    _isChatGroup,
    _withAdmin,
    _goToChat,

    _onUpdateUserInfos,
    _onUpdateUserInOneChat,
    onUpdateUserInChatSection,
    onUpdateUserInOneChat
}
