import {mapGetters} from "vuex";

export default {
    computed: {
      ...mapGetters(["$api"])
    },
    methods: {
        _updateUserInformation(userToUpdate, userInfo){
            // userInfo = {userID?: string, information?: { ... }}
            if(userInfo && userToUpdate){
                if(userInfo.information) userToUpdate.img = this._formatUserImage(userInfo.information.img)
                if(userInfo.userID) userToUpdate.userID = userInfo.userID
            }
        },
        _formatUserImage(image){
            return image ? this.$api.images.path(image) : ''
        }
    }
}