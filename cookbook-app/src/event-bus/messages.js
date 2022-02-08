export default function (bus){
    /* TODO: RIGUARDARE */
    function pushMessages(chats){ //[{info, messages}]

        const store = this.$store
        const userIdentifier = store.getters.userIdentifier
        const isAdmin = store.getters.isAdmin

        chats.filter(chat => chat.messages && chat.messages.length > 0)
            .map(chat =>{
                // if chatInfo.type === 'one' & MY ROLE IS 'READER' IN chatInfo.usersRole THEN UPDATE MY ROLE: 'READER' -> 'WRITER'
                if(chat.info.type === 'one' && chat.info.usersRole.find(r => r.role === 'reader' && r.user === userIdentifier)) {
                    const role = 'writer'
                    store.dispatch('chats/update-role', {chatID: chat.info._id, role})
                        .then(({data}) => {
                            console.log(data)
                            this.$socket.on('chat:change:role:ok', () => bus.$emit('chat:change:role', chat.info._id, {user: userIdentifier, role}))
                            this.$socket.emit('chat:change:role', chat.info._id, { user: userIdentifier, role })
                        })
                        .catch(err => console.error(err))
                }
                return chat
            })
            .forEach(chat => {
                console.log(`From chat ${JSON.stringify(chat.info)}, pushed messages: ${JSON.stringify(chat.messages)}`)

                chat.messages.forEach(message => {
                    const dest = chat.info.type === 'one' || isAdmin ? 'da ' + message.sender.userID :
                        chat.info.type === 'group' ? 'in ' + chat.info.name : ''

                    if(! ['chat', 'p-user-chats'].includes(this.$route.name) ) {
                        this.$bvToast.toast('Hai ricevuto un nuovo messaggio ' + dest, { title: 'Messaggio', solid: true, variant: 'info', })
                    }
                    store.commit('chats/add-unread')
                    bus.$emit('push-message', chat.info, message)
                })
            })

    }

    return {
        pushMessages
    }
}
