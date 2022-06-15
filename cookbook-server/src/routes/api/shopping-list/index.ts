import { shoppingListController } from "../../../controllers"
import { shoppingListMiddleware } from "../../../middlewares"

export default function (app) {
    app.route("/api/users/:id/shopping-list")
        .post(shoppingListMiddleware.add(), shoppingListController.addFood)
        .get(shoppingListMiddleware.list(), shoppingListController.list)

    app.route("/api/users/:id/shopping-list/:pointShoppingListID")
        .patch(shoppingListMiddleware.update(), shoppingListController.updateFoodOnList)
        .delete(shoppingListMiddleware.erase(), shoppingListController.deleteFoodOnList)
}
