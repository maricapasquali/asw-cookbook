import comments from './comments'
import foods from './foods'
import friends from './friends'
import likes from './likes'
import notifications from './notifications'
import recipes from './recipes'
import session from './session'
import shoppingList from './shopping-list'
import users from './users'
import chats from './chats'
import messages from './messages'

export default function (bus) {
    return  {
        comments: comments(bus),
        foods: foods(bus),
        friends: friends(bus),
        likes: likes(bus),
        notifications: notifications(bus),
        recipes: recipes(bus),
        session: session(bus),
        shoppingList: shoppingList(bus),
        users: users(bus),
        chats: chats(bus),
        messages: messages(bus),
    }
}

