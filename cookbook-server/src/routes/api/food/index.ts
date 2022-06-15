import { foodController } from "../../../controllers"
import { foodMiddleware } from "../../../middlewares"

export default function (app) {
    app.route("/api/foods")
        .post(foodMiddleware.create(), foodController.createFood)
        .get(foodMiddleware.list(), foodController.listFoods)

    app.route("/api/foods/:id")
        .get(foodMiddleware.one(), foodController.oneFood)
        .patch(foodMiddleware.update(), foodController.updateFood)
}
