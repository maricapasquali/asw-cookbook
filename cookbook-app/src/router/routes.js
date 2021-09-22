import Login from '@views/Login'
import CheckAccount from "@views/CheckAccount";
import NotFound from '@views/404'
import HomePage from "@views/HomePage";
import PersonalArea from "@views/PersonalArea";
import OneUser from "@views/OneUser";
import Searches from "@views/Searches";
import ChangePassword from "@views/ChangePassword";

export default [
    {
        path: '/login',
        name: 'login',
        component: Login
    },
    {
        path: '/end-signup',
        name: 'end-signup',
        component: CheckAccount
    },
    {
        path: '/',
        name: 'homepage',
        component: HomePage
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ChangePassword
    },
    {
        path: '/users/:id/change-default-password', //PRIVATE: ONLY FIRST LOGIN ADMIN
        name: 'change-password',
        component: ChangePassword
    },
    {
        path: '/search/:what',
        name: 'search',
        component: Searches
    },
    {
        path: '/users/:id',
        name: 'single-user',
        component: OneUser
    },
    {
        path: '/users/:id/personal-area', // PRIVATE (se il token non c'è o se il token non è dell' id )
        name: 'p-user-account',
        component: PersonalArea,
    },
    {
        path: '/users/:id/personal-area/recipes', // PRIVATE (se il token non c'è o se il token non è dell' id )
        name: 'p-user-recipes',
        component: PersonalArea,
        props:{
            active: 'recipes'
        }
    },
    {
        path: '/users/:id/personal-area/foods', // PRIVATE (se il token non c'è o se il token non è dell' id )
        name: 'p-user-foods',
        component: PersonalArea,
        props:{
            active: 'foods'
        }
    },
    {
        path: '/users/:id/personal-area/friends', // PRIVATE (se il token non c'è o se il token non è dell' id )
        name: 'p-user-friends',
        component: PersonalArea,
        props:{
            active: 'friends'
        }
    },
    {
        path: '/users/:id/personal-area/chats', // PRIVATE (se il token non c'è o se il token non è dell' id )
        name: 'p-user-chats',
        component: PersonalArea,
        props:{
            active: 'chats'
        }
    },
    {
        path: '/users/:id/personal-area/notifications', // PRIVATE (se il token non c'è o se il token non è dell' id )
        name: 'p-user-notifications',
        component: PersonalArea,
        props:{
            active: 'notifications'
        }
    },

    {
        path: '/users/:id/personal-area/reports', // PRIVATE (se il token non c'è o se il token non è dell' id )
        name: 'p-user-reports',
        component: PersonalArea,
        props:{
            active: 'reports'
        }
    },

    {
        path: '/users/:id/personal-area/users', // PRIVATE (se il token non c'è o se il token non è dell' id )
        name: 'p-user-users',
        component: PersonalArea,
        props:{
            active: 'users'
        }
    },
    {
        path: '*',
        component: NotFound
    }
]