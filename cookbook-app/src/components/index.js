// DIRECTIVES
import directives from '@components/directives'

//COMPONENTS
import CenterContainer from '@components/center-container'
import PreviewUploader from "@components/preview-uploader";
import Loading from "@components/loading"
import SelectWithImage from "@components/select-with-image";
import WrapLoading from "@components/wrap-loading";
import ElapsedTime from "@components/elapsedTime";
import MiniTextEditor from "@components/mini-text-editor"

import ServerErrorHandler from '@components/app/handler-errors/server-error-handler'
import BadRequestErrorHandler from '@components/app/handler-errors/bad-request-error-handler'
import UnAuthenticatedErrorHandler from '@components/app/handler-errors/unauthenticated-error-handler'
import ForbiddenErrorHandler from '@components/app/handler-errors/forbidden-error-handler'
import NotFoundErrorHandler from '@components/app/handler-errors/not-found-error-handler'

import InputPassword from "@components/app/input-password";
import ModalAlert from "@components/app/modal-alert"
import NotAuthorizedArea from "@components/app/not-authorized-area"
import Navigator from "@components/app/navigator"
import Footer from "@components/app/footer"
import NutrientsTable from "@components/app/nutrients-table"
import CountryImage from "@components/app/country-image"
import Avatar from "@components/app/avatar"
import Like from "@components/app/like"
import BFriendship from "@components/app/b-friendship"

import SignUp from "@components/login/SignUp";

import UserInformation from "@components/personal-area/user-information"
import ChangeUserInformation from "@components/personal-area/change-user-information"
import DeleteAccount from "@components/personal-area/delete-account"
import ChangeUserID from "@components/personal-area/change-userid"
import ChangePassword from "@components/personal-area/change-password"
import RecipesSections from "@components/personal-area/recipes/recipe-sections"
import LikerList from "@components/personal-area/recipes/liker-list"
import RecipeForm from "@components/personal-area/recipes/recipe-form"
import FoodSection from "@components/personal-area/foods/food-section"
import ReportsSection from "@components/personal-area/admin/reports/reports-section"
import UsersSection from "@components/personal-area/admin/users/users-section"
import FriendsSection from "@components/personal-area/friends/friends-section"
import NotificationsSection from "@components/personal-area/notifications/notifications-section"

import Chat from '@components/chats/chat'
import ChatHeader from '@components/chats/chat-header'
import ChatFooter from '@components/chats/chat-footer'
import ChatMessage from '@components/chats/chat-message'
import ChatAttachments from '@components/chats/chat-attachments'
import AttachmentPreview from '@components/chats/attachment-preview'
import ChatTyping from '@components/chats/chat-typing'

import ChatItem from '@components/personal-area/chats/chat-item'
import ChatsSection from '@components/personal-area/chats/chats-section'

import FoodForm from "@components/foods/food-form"
import FoodFinder from "@components/foods/food-finder"
import BarcodeScanner from "@components/foods/barcode-scanner"

import PreviewRecipeTutorial from "@components/recipes/preview-recipe-tutorial"
import PreviewRecipeImage from "@components/recipes/preview-recipe-image"
import RecipeDetails from "@components/recipes/recipe-details"
import IngredientList from "@components/recipes/ingredient-list"

import Comments from "@components/comments/comments"
import Comment from "@components/comments/comment"

import SearchUsers from "@components/searches/user/search-users"
import SearchRecipes from "@components/searches/recipe/search-recipes"
import CheckboxPillButton from "@components/searches/recipe/checkbox-pill-button"
import FilterApply from "@components/searches/recipe/filter-apply"
import WorldMap from "@components/searches/recipe/world-map"

import ContainerCollapsable from '@components/one-user/container-collapsable'

const components = {
    CenterContainer,
    PreviewUploader,
    Loading,
    SelectWithImage,
    WrapLoading,
    ElapsedTime,
    MiniTextEditor,

    ServerErrorHandler,
    BadRequestErrorHandler,
    UnAuthenticatedErrorHandler,
    ForbiddenErrorHandler,
    NotFoundErrorHandler,

    InputPassword,
    ModalAlert,
    NotAuthorizedArea,
    Navigator,
    Footer,
    NutrientsTable,
    CountryImage,
    Avatar,
    Like,
    BFriendship,

    SignUp,

    UserInformation,
    ChangeUserInformation,
    DeleteAccount,
    ChangeUserID,
    ChangePassword,
    RecipesSections,
    LikerList,
    RecipeForm,
    FoodForm,
    FoodFinder,
    FoodSection,
    BarcodeScanner,
    ReportsSection,
    UsersSection,
    FriendsSection,
    NotificationsSection,

    Chat,
    ChatHeader,
    ChatFooter,
    ChatMessage,
    ChatAttachments,
    AttachmentPreview,
    ChatTyping,

    ChatItem,
    ChatsSection,

    PreviewRecipeTutorial,
    PreviewRecipeImage,
    RecipeDetails,
    IngredientList,

    Comments,
    Comment,

    SearchUsers,
    SearchRecipes,
    CheckboxPillButton,
    FilterApply,
    WorldMap,

    ContainerCollapsable
}

export default function install(Vue, options){
    Object.values(components).forEach(comp => Vue.component(comp.name, comp))
    Object.entries(directives).forEach(([id, directive]) => Vue.directive(id, directive))

    console.log('Install plugin Custom Components and directives ...')
}
