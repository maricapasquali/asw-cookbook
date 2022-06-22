/* eslint-disable func-style */

// MAIN ROUTES
const Login = () => import("@views/Login")
const CheckAccount = () => import("@views/CheckAccount")
const NotFound = () => import("@views/404")
const HomePage = () => import("@views/HomePage")

const UserArea = () => import("@views/UserArea")
const Searches = () => import("@views/Searches")
const ChatRecipe = () => import("@views/ChatRecipe")
const OneChat = () => import("@views/OneChat")

// SUB ROUTES
const ChangePassword = () => import("@views/user-area/ChangePassword")
const PersonalArea = () => import("@views/user-area/PersonalArea")
const OneUser = () => import("@views/user-area/OneUser")
const OneRecipe = () => import("@views/user-area/OneRecipe")

// BOTH
const UserInformation = () => import("@components/personal-area/user-information")
// SIGNED
const RecipesSection = () => import("@components/personal-area/recipes/recipes-section")
// BOTH
const FoodSection = () => import("@components/personal-area/foods/food-section")
// ADMIN
const ReportSection = () => import("@components/personal-area/admin/reports/reports-section")
// ADMIN
const UserSection = () => import("@components/personal-area/admin/users/users-section")
// SIGNED
const FriendSection = () => import("@components/personal-area/friends/friends-section")
// BOTH
const ChatSection = () => import("@components/personal-area/chats/chats-section")
// BOTH
const NotificationSection = () => import("@components/personal-area/notifications/notifications-section")

export default [
    {
        path: "/login",
        name: "login",
        component: Login
    },
    {
        path: "/end-signup",
        name: "end-signup",
        component: CheckAccount
    },
    {
        path: "/",
        name: "homepage",
        component: HomePage
    },
    {
        path: "/reset-password",
        name: "reset-password",
        component: ChangePassword
    },
    {
        path: "/search/:what",
        name: "search",
        component: Searches
    },
    // USER
    {
        path: "/users",
        redirect: {
            name: "search",
            params: {
                what: "users"
            }
        }
    },
    {
        path: "/users/:id",
        component: UserArea,
        children: [
            {
                path: "",
                name: "single-user",
                component: OneUser,
                props: route => ({ id: route.params.id })
            },
            {
                path: "recipes/:recipeId",
                name: "single-recipe",
                component: OneRecipe
            },
            {
                path: "personal-area", // PRIVATE (se il token non c'è o se il token non è dell' id )
                component: PersonalArea,
                children: [
                    {
                        name: "p-user-account",
                        path: "",
                        component: UserInformation,
                        props: route => ({ id: route.params.id, personalArea: true })
                    },
                    {
                        path: "recipes",
                        name: "p-user-recipes",
                        component: RecipesSection
                    },
                    {
                        path: "foods",
                        name: "p-user-foods",
                        component: FoodSection
                    },
                    {
                        path: "reports",
                        name: "p-user-reports",
                        component: ReportSection
                    },
                    {
                        path: "users",
                        name: "p-user-users",
                        component: UserSection,
                    },
                    {
                        path: "friends",
                        name: "p-user-friends",
                        component: FriendSection,
                    },
                    {
                        path: "chats",
                        name: "p-user-chats",
                        component: ChatSection
                    },
                    {
                        path: "notifications",
                        name: "p-user-notifications",
                        component: NotificationSection,
                    },

                ]
            },
            {
                path: "change-default-password", //PRIVATE: ONLY FIRST LOGIN ADMIN
                name: "change-password",
                component: ChangePassword
            },
        ]
    },
    // RECIPE
    {
        path: "/recipes",
        redirect: {
            name: "search",
            params: {
                what: "recipes"
            }
        }
    },
    {
        path: "/recipes/:recipeId",
        name: "recipe",
        component: OneRecipe
    },
    // CHAT
    {
        path: "/chats/:chatId",
        name: "chat",
        component: OneChat
    },
    {
        path: "/chats/:chatId/recipes/:recipeId", //PRIVATE: ONLY FOR CHAT USERS
        name: "recipe-shared-chat",
        component: ChatRecipe
    },
    {
        path: "*",
        component: NotFound
    }
]
