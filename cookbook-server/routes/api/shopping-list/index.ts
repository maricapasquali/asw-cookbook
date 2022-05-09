import {shoppingListController} from '../../../controllers'
import {shoppingListMiddleware} from '../../../middlewares'

export default function (app){

    app.route('/api/users/:id/shopping-list')
        .post(shoppingListMiddleware.add(), shoppingListController.add_food)
        .get(shoppingListMiddleware.list(), shoppingListController.list)

    app.route('/api/users/:id/shopping-list/:pointShoppingListID')
        .patch(shoppingListMiddleware.update(), shoppingListController.update_food_on_list)
        .delete(shoppingListMiddleware.erase(), shoppingListController.delete_food_on_list)
}