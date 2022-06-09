import {Middlewares} from "../../base";
import {uploadProfileImage} from "../base";

export function create(): Middlewares {
    return uploadProfileImage()
}