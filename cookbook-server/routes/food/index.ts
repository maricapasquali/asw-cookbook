import * as foodController from '../../controllers/food'

export default function (app){

    app.route('/api/foods')
        //.all(foodController.uploadImage()) //NOTA: nel client ora non è implementato
        .post(foodController.create_food)
        .get(foodController.list_foods)


    app.route('/api/foods/:id')
        .get(foodController.one_food)

}