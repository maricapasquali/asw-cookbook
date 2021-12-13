import appRoute from './routes'

export function unauthorizedError(router, store){
    console.error('Unauthorized error 401. No more logged.')
    store.commit('endSession')
    const privateRoute = appRoute
            .filter(r => r.component.name === 'PersonalArea' || r.component.name === 'ChangePassword')
            .map(r => r.name)
    console.debug(privateRoute)
    if(privateRoute.includes(router.currentRoute.name)) {
        //router.push({name: 'login'}) or router.push({name: 'homepage'})
        console.debug('Go login/homepage.')
    } else {
        //router.go()
        console.debug('Reload page.')
    }
}