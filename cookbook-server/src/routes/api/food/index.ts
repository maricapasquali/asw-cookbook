import {foodController} from '../../../controllers'
import {foodMiddleware} from '../../../middlewares'

export default function (app){

    app.route('/api/foods')
        .post(foodMiddleware.create(), foodController.create_food)
        .get(foodMiddleware.list(), foodController.list_foods)


    app.route('/api/foods/:id')
        .get(foodMiddleware.one(), foodController.one_food)
        .patch(foodMiddleware.update(), foodController.update_food)

}