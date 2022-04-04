import friends from "./friends";
import foods from "./foods";
import comments from "./comments";
import recipes from "./recipes";
import userInfos from "./user-infos";
import likes from "./likes";

export default function (bus, store, router){
    return {
        ...friends(bus, store),
        ...foods(bus, store),
        ...comments(bus, store),
        ...recipes(bus, store),
        ...userInfos(bus, store, router),
        ...likes(bus, store)
    }
}