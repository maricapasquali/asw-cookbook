import {v4} from "uuid";

export function requestId(req, res, next) {
    req.id = v4();
    next()
}
