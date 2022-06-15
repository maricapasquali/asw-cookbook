<template>
  <div>
    <b-avatar
      :id="avatarId"
      :variant="variant"
      :src="image_"
      :icon="default_"
      :size="size"
      :badge="badge_"
      badge-variant="success"
      class="mr-2"
      @img-error="imageError"
    />

    <router-link
      v-if="userId && link"
      :class="userIdClass"
      :to="{name: 'single-user', params: {id: user}}"
    >
      <strong> <em> {{ userId }}</em></strong>
    </router-link>
    <span
      v-else-if="userId"
      :class="userIdClass"
    > <em> {{ userId }}</em></span>
  </div>
</template>

<script>

import { mapGetters } from "vuex"
import { UserMixin } from "@mixins"

export default {
    name: "Avatar",
    mixins:[UserMixin],
    props: {
        value: {
            type: String,
            default: ""
        }, //image
        user: { // Users Identifier ( _id | [_id] )
            type: [String, Array],
            required: true
        },
        userId: { // Username ( userID )
            type: String,
            default: ""
        },
        link: Boolean,
        userIdClass: {
            type: String,
            default: ""
        },
        size: {
            type: Number,
            default: 70
        },
        variant: {
            type: String,
            default: "dark"
        },
        group: Boolean
    },
    data() {
        return {
            default_: "",
            image_: "",
            badge_: false,
        }
    },
    computed: {
        ...mapGetters({
            _onlines: "users/online",
            _offlines: "users/offline"
        }),
        avatarId() {
            return "avatar"+(`-${this.user}` || "")
        }
    },
    watch: {
        value(vl) {
            this.setImage(vl)
        },
        user(vl) {
            this._setBadge(this._onlines, vl)
        },
        _onlines(val) {
            this._setBadge(val, this.user)
        }
    },
    created() {
        this.default_ = this.group ? "people-fill": ""
        this.setImage(this.value)
        this._setBadge(this._onlines, this.user)
    },
    methods: {
        imageError() {
            console.error("Image " + this.image_ + " is not found.")
            this.image_ = ""
            this.$emit("onNotFound")
        },

        setImage(vl) {
            this.image_ = this._formatUserImage(vl)
        },

        _setBadge(usersOnline, vl) {
            if ( Array.isArray(vl) ) {
                let isOnline = vl.some(i => usersOnline.includes(i))
                let isAllOffline = vl.every(i => !usersOnline.includes(i))
                this.badge_ = isOnline
                vl.forEach(i => {
                    let online = usersOnline.includes(i)
                    if (online) this.$emit("online", { _id: i })
                    let offline = this._offlines[i]
                    if (offline) this.$emit("offline", { _id: i, offline }, isAllOffline)
                    console.debug(`State of '${i}' is ${online ? "online": "offline"}`)
                })
            } else if (vl) {
                let isOnline = usersOnline.some(s => s === vl)
                this.badge_ = isOnline
                if (isOnline) this.$emit("online", { _id: vl })
                else if (this._offlines[vl]) this.$emit("offline", { _id: vl, offline: this._offlines[vl] }, true)
                console.debug(`State of '${vl}' is ${isOnline ? "online": "offline"}`)
            }
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
