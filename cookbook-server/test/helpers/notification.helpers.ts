import {User} from "../../src/models";
import * as bcrypt from "bcrypt"

/* -- EXPORTED FUNCTIONALITY -- */

export const kyle = {
    _id: "623b9fd54a142c245c6de540",
    information: {
        firstname: "kyle",
        lastname: "smith",
        email: "kyle@gmail.com"
    },
    credential: {
        userID: "Kyle066",
        hash_password: bcrypt.hashSync("password", 10)
    },
    signup: "checked"
}

export const marica = {
    _id: "623b9fd54a142c245c6de541",
    information: {
        firstname: "marica",
        lastname: "pasquali",
        email: "pasquali@gmail.com"
    },
    credential: {
        userID: "maricapasquali",
        hash_password: bcrypt.hashSync("password", 10)
    },
    signup: "checked"
}

export const kira = {
    _id: "623b9fd54a142c245c6de542",
    information: {
        firstname: "kira",
        lastname: "green",
        email: "green@gmail.com"
    },
    credential: {
        userID: "kira01",
        hash_password: bcrypt.hashSync("password", 10)
    },
    signup: "checked"
}

export const insertSomeUsers = (): Promise<any> => User.insertMany([kyle, marica, kira])
