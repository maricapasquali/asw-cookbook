<template>
  <b-modal
    v-model="show"
    body-class="position-static"
    title="Cambia userID"
    :hide-footer="validation!==true || processing"
    no-close-on-esc
    no-close-on-backdrop
    ok-only
    centered
    @hide="close"
  >
    <b-alert
      v-model="error.show"
      variant="danger"
    >
      {{ error.message }}
    </b-alert>
    <wrap-loading v-model="processing">
      <b-form-group
        label="UserID"
        label-for="c-userID"
        class="py-2"
      >
        <b-form-input
          id="c-userID"
          v-model.trim="userID"
          type="text"
          :state="validation"
          @input="check"
        />
      </b-form-group>
    </wrap-loading>
    <template #modal-footer>
      <b-button
        variant="primary"
        @click="changeUserID"
      >
        Cambia
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters } from "vuex"

export default {
    name: "ChangeUserid",
    props:{
        value: Boolean,
        id: {
            type: String,
            required: true
        },
        oldUserId: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            show: false,
            processing: false,
            error:{
                show: false,
                message: ""
            },

            userID: "",
            validation: null,
        }
    },
    computed: {
        ...mapGetters({
            accessToken: "session/accessToken"
        })
    },
    watch: {
        value(val) {
            this.show = val
        },
        show(vl) {
            this.$emit("input", vl)
        },
        processing(val) {
            if (val) this.error = { show: false, message: "" }
        }
    },
    mounted() {
        this.userID = this.oldUserId
    },
    methods: {
        check() {
            this.validation = this.userID.length===0 ? false : (this.oldUserId === this.userID ? null : true)
        },
        close() {
            console.debug("close change userID modal  ...")
            this.$emit("close")
        },
        changeUserID(e) {
            e.preventDefault()
            this.processing = true

            this.$store.dispatch("users/update-username", { oldUsername: this.oldUserId, newUsername: this.userID })
                .then(() => {
                    console.debug("CHANGE USER ID...")
                    this.$emit("onChangeUserID", this.userID)
                    this.$socket.emit("user:update:info", { _id: this.id, userID: this.userID })
                    this.show = false
                })
                .catch(err => {
                    let message = this.$store.$api.errorsHandler.users.changeUserID(err)
                    if (message) this.error = { show: true, message }
                })
                .finally(() => this.processing = false)
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
