import {v4} from "uuid";

export function requestId(req, res, next) {
    req.id = v4();
    next()
}

export * as userMiddleware from "./user";
export * as sessionMiddleware from "./user/session";
export * as friendMiddleware from "./user/friend";
export * as shoppingListMiddleware from "./shopping-list";
export * as recipeMiddleware from "./recipe";
export * as commentMiddleware from "./recipe/comment";
export * as likeMiddleware from "./recipe/like";
export * as notificationMiddleware from "./notification";
export * as foodMiddleware from "./food";
export * as chatMiddleware from "./chat";
export * as messageMiddleware from "./chat/message";
