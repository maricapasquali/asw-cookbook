import CenterContainer from './center-container'
import PreviewUploader from "./preview-uploader";
import Loading from "./loading"
import SelectWithImage from "./select-with-image";
import WrapLoading from "./wrap-loading";
import ElapsedTime from "./elapsedTime";
import MiniTextEditor from "./mini-text-editor"

import ServerErrorHandler from './app/handler-errors/server-error-handler'
import BadRequestErrorHandler from './app/handler-errors/bad-request-error-handler'
import UnAuthenticatedErrorHandler from './app/handler-errors/unauthenticated-error-handler'
import ForbiddenErrorHandler from './app/handler-errors/forbidden-error-handler'
import NotFoundErrorHandler from './app/handler-errors/not-found-error-handler'

import InputPassword from "./app/input-password";
import ModalAlert from "./app/modal-alert"
import NotAuthorizedArea from "./app/not-authorized-area"
import Navigator from "./app/navigator"
import Footer from "./app/footer"
import NutrientsTable from "./app/nutrients-table"
import CountryImage from "./app/country-image"
import Avatar from "./app/avatar"
import Like from "./app/like"
import BFriendship from "./app/b-friendship"

import SignUp from "./login/SignUp";

import UserInformation from "./personal-area/user-information"
import DeleteAccount from "./personal-area/delete-account"
import ChangeUserID from "./personal-area/change-userid"
import ChangePassword from "./personal-area/change-password"
import RecipesSections from "./personal-area/recipes/recipe-sections"
import LikerList from "./personal-area/recipes/liker-list"
import RecipeForm from "./personal-area/recipes/recipe-form"
import FoodSection from "./personal-area/foods/food-section"
import ReportsSection from "./personal-area/admin/reports/reports-section"
import UsersSection from "./personal-area/admin/users/users-section"
import FriendsSection from "./personal-area/friends/friends-section"
import NotificationsSection from "./personal-area/notifications/notifications-section"

import Chat from './chats/chat'
import ChatHeader from './chats/chat-header'
import ChatFooter from './chats/chat-footer'
import ChatMessage from './chats/chat-message'
import ChatAttachments from './chats/chat-attachments'
import AttachmentPreview from './chats/attachment-preview'
import ChatTyping from './chats/chat-typing'

import ChatItem from './personal-area/chats/chat-item'
import ChatsSection from './personal-area/chats/chats-section'

import FoodForm from "./foods/food-form"
import FoodFinder from "./foods/food-finder"
import BarcodeScanner from "./foods/barcode-scanner"

import PreviewRecipeTutorial from "./recipes/preview-recipe-tutorial"
import PreviewRecipeImage from "./recipes/preview-recipe-image"
import RecipeDetails from "./recipes/recipe-details"
import IngredientList from "./recipes/ingredient-list"

import Comments from "./comments/comments"
import Comment from "./comments/comment"

import SearchUsers from "./searches/user/search-users"
import SearchRecipes from "./searches/recipe/search-recipes"
import CheckboxPillButton from "./searches/recipe/checkbox-pill-button"
import FilterApply from "./searches/recipe/filter-apply"
import WorldMap from "./searches/recipe/world-map"

import ContainerCollapsable from './one-user/container-collapsable'


export default {
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