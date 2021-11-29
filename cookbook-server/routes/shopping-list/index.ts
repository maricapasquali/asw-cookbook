import * as shoppingListController from '../../controllers/shopping-list'

export default function (app){

    app.route('/api/users/:id/shopping-list')
        .post(shoppingListController.add_food)
        .get(shoppingListController.list)

    app.route('/api/users/:id/shopping-list/:pointShoppingListID')
        .patch(shoppingListController.update_food_on_list)
        .delete(shoppingListController.delete_food_on_list)
}