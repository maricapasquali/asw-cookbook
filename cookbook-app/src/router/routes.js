// MAIN ROUTES
import Login from '@views/Login'
import CheckAccount from "@views/CheckAccount";
import NotFound from '@views/404'
import HomePage from "@views/HomePage";

import UserArea from "@views/UserArea";
import Searches from "@views/Searches";
import ChatRecipe from "@views/ChatRecipe";
import OneChat from "@views/OneChat";

// SUB ROUTES
import ChangePassword from "@views/user-area/ChangePassword";
import PersonalArea from "@views/user-area/PersonalArea";
import OneUser from "@views/user-area/OneUser";
import OneRecipe from "@views/user-area/OneRecipe";

// BOTH
import UserInformation from "@components/personal-area/user-information"
// SIGNED
import RecipeSection from "@components/personal-area/recipes/recipe-sections"
// BOTH
import FoodSection from "@components/personal-area/foods/food-section"
// ADMIN
import ReportSection from "@components/personal-area/admin/reports/reports-section"
// ADMIN
import UserSection from "@components/personal-area/admin/users/users-section"
// SIGNED
import FriendSection from "@components/personal-area/friends/friends-section"
// BOTH
import ChatSection from "@components/personal-area/chats/chats-section"
// BOTH
import NotificationSection from "@components/personal-area/notifications/notifications-section"

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
        path: '/search/:what',
        name: 'search',
        component: Searches
    },
    // USER
    {
      path: '/users',
      redirect: {
          name: 'search',
          params: {
              what: 'users'
          }
      }
    },
    {
        path: '/users/:id',
        name: 'single-user',
        component: UserArea,
        children: [
            {
                path: '',
                name: 'single-user',
                component: OneUser
            },
            {
                path: 'recipes/:recipe_id',
                name: 'single-recipe',
                component: OneRecipe
            },
            {
                path: 'personal-area', // PRIVATE (se il token non c'è o se il token non è dell' id )
                component: PersonalArea,
                children: [
                    {
                        name: 'p-user-account',
                        path: '',
                        component: UserInformation,
                        props: route => ({ id: route.params.id, personalArea: true })
                    },
                    {
                        path: 'recipes',
                        name: 'p-user-recipes',
                        component: RecipeSection
                    },
                    {
                        path: 'foods',
                        name: 'p-user-foods',
                        component: FoodSection
                    },
                    {
                        path: 'reports',
                        name: 'p-user-reports',
                        component: ReportSection
                    },
                    {
                        path: 'users',
                        name: 'p-user-users',
                        component: UserSection,
                    },
                    {
                        path: 'friends',
                        name: 'p-user-friends',
                        component: FriendSection,
                    },
                    {
                        path: 'chats',
                        name: 'p-user-chats',
                        component: ChatSection
                    },
                    {
                        path: 'notifications',
                        name: 'p-user-notifications',
                        component: NotificationSection,
                    },

                ]
            },
            {
                path: 'change-default-password', //PRIVATE: ONLY FIRST LOGIN ADMIN
                name: 'change-password',
                component: ChangePassword
            },
        ]
    },
    // RECIPE
    {
        path: '/recipes',
        redirect: {
            name: 'search',
            params: {
                what: 'recipes'
            }
        }
    },
    {
        path: '/recipes/:recipe_id',
        name: 'recipe',
        component: OneRecipe
    },
    // CHAT
    {
        path: '/chats/:chat_id',
        name: 'chat',
        component: OneChat
    },
    {
        path: '/chats/:chat_id/recipes/:recipe_id', //PRIVATE: ONLY FOR CHAT USERS
        name: 'recipe-shared-chat',
        component: ChatRecipe
    },
    {
        path: '*',
        component: NotFound
    }
]
