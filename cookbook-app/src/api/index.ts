import users from './users'
import friends from './users/friends'
import foods from './foods'
import recipes from './recipes'
import shoppingList from './shopping-list'
import notifications from './notifications'
import chats from './chats'

import methods, {MethodsAxios} from './methods'

export default function (serverConfiguration){
    let _methods: MethodsAxios = methods(serverConfiguration)

    return {
        ..._methods.info,

        users: users(_methods),
        friends: friends(_methods),
        foods: foods(_methods),
        recipes: recipes(_methods),
        shoppingList: shoppingList(_methods),
        notifications: notifications(_methods),
        chats: chats(_methods)
    }
}
