
export function uploadImageOrTutorial(){}

export function create_recipe(req, res){ return res.status(501).send('create recipe') }

export function delete_recipe(req, res){ return res.status(501).send('delete recipe') }

export function update_recipe(req, res){ return res.status(501).send('update recipe')}

export function one_recipe(req, res){ return res.status(501).send('get recipe') }
export function private_version_one_recipe(req, res){ /*TODO: check authorization & */ one_recipe(req, res) }

export function list_recipes(req, res){ return res.status(501).send('list recipes') }
export function private_version_recipes(req, res){ /*TODO: check authorization & */ list_recipes(req, res) }

export function numberRecipesForCountry(req, res){  return res.status(501).send('number Recipes For Country') }