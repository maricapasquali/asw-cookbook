import {CancelToken} from "axios";

export type PaginationOptions = { page: number, limit: number, skip?: number }

export type OptionsRequestType = { cancelToken?: CancelToken }

export type FoodsQueryOptions = { name?: string, barcode?: string, owner?: string }

export type RecipeFilters = { name?: string, countries?: string[], diets?: string[], categories?: string[], ingredients?: string[] }

export type UserSearch = { search: 'full' | 'partial', value: string }

export type UserQueryOptions = { userID?: UserSearch, fullname?: UserSearch }

export type ChatQueryOptions = { 'no-messages' : boolean }