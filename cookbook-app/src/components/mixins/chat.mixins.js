import * as _ from 'lodash'
import Server from "@api/server.info";
import {mapGetters} from "vuex";

function _lastAccess(chatType, users){
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

function _baseInfoUser(chatInfo, users) {
    if (chatInfo.type === 'one' && users.length === 2) {
        const otherUser = users.find(r => r.user?._id !== this.userIdentifier)
        if (otherUser) console.debug('Other user: base info = ', JSON.stringify(otherUser.user))
        return otherUser && {_id: otherUser.user?._id, name: otherUser.user.userID, img: otherUser.user.img}
    }
    else {
        if(chatInfo.type === 'group' && this.isAdmin) {
            const otherUser = users.find(r => r.user && r.user.role !== 'admin')
            return otherUser && {_id: otherUser.user?._id, name: otherUser.user?.userID}
        }
        return {
            _id: users.filter(r => r.user?._id !== this.userIdentifier).map(r => r.user?._id),
            name: chatInfo.name,
            img: chatInfo.img
        }
    }
}

function _isChatOne(chatInfo){
    return chatInfo.type === 'one'
}

function _isChatGroup(chatInfo){
    return chatInfo.type === 'group'
}

function _withAdmin(users){
    return users.some(r => r.user?.role === 'admin')
}

function _amIReader(users){
   return users.find(r => r.user?._id === this.userIdentifier && r.role === 'reader')
}

function _amINotReader(users){
    return users.find(r => r.user?._id === this.userIdentifier && r.role !== 'reader')
}

function _goToChat(user_id, callbackCreateChat) {
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
        .then(({data}) => data)
        .catch(this.handleRequestErrors.chats.createChat)
        .then(chat => {
            if(chat) {
                if(isCallable(callbackCreateChat)) callbackCreateChat(chat)
                else this.$router.push(link(isString(chat) ? chat : chat._id))
            }
        })
}

/* Listeners updates */
function _onUpdateUserInfos(user, newInfos){
    if(user && newInfos){
        if(newInfos.information) user.img = newInfos.information.img ? Server.images.path(newInfos.information.img) : ''
        if(newInfos.userID) user.userID = newInfos.userID
    }
}

function _onUpdateUserInfosInMessages(messages, userInfo){
    messages?.filter(m => m.sender?._id === userInfo._id).forEach(m => this._onUpdateUserInfos(m.sender, userInfo))
}

function _onUpdateUserInOneChat(chat, userInfo){
    const foundUserInChat = chat.users.find(r => r.user?._id === userInfo._id)
    this._onUpdateUserInfos(foundUserInChat && foundUserInChat.user, userInfo)
    this._onUpdateUserInfosInMessages(chat.messages, userInfo)
}

export default {
    computed: {
      ...mapGetters({
          userIdentifier: 'session/userIdentifier',
          isAdmin: 'session/isAdmin',
      })
    },
    methods: {
        _lastAccess,
        _baseInfoUser,
        _isChatOne,
        _isChatGroup,
        _withAdmin,
        _amIReader,
        _amINotReader,
        _goToChat,

        _onUpdateUserInfos,
        _onUpdateUserInfosInMessages,
        _onUpdateUserInOneChat,
    }
}