import friends from "./friends";
import foods from "./foods";
import comments from "./comments";
import recipes from "./recipes";
import userInfos from "./user-infos";
import likes from "./likes";

export default {
    ...friends,
    ...foods,
    ...comments,
    ...recipes,
    ...userInfos,
    ...likes
}