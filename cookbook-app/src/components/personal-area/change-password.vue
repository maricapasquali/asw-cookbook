<template>
  <b-modal
    v-model="show"
    body-class="position-static"
    title="Cambia password"
    :hide-footer="validation!==true || processing || success"
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
    <b-alert
      v-if="success"
      v-model="success"
      variant="success"
    >
      La password è stata cambiata.
    </b-alert>
    <b-form v-else>
      <wrap-loading v-model="processing">
        <div class="p-2">
          <b-form-group
            label="Vecchia password *"
            label-for="old-p"
          >
            <input-password-switch-visibility
              id="old-p"
              v-model="oldPassword"
              placeholder="Enter old password"
              :state="validationOld"
              required
              @input="checkOldPassword"
            />
            <b-form-valid-feedback :state="validationOld">
              Corretta!
            </b-form-valid-feedback>
          </b-form-group>
          <form-inputs-password
            :old="oldPassword"
            @inputPassword="newPassword=$event"
            @checkPassword="checkNewPassword=$event"
          />
        </div>
      </wrap-loading>
    </b-form>
    <template #modal-footer>
      <b-button
        variant="primary"
        @click="change"
      >
        Cambia
      </b-button>
    </template>
  </b-modal>
</template>

<script>

import { mapGetters } from "vuex"

export default {
    name: "ChangePassword",
    props: {
        value: Boolean,
        id: { //user identifier
            type: String,
            required: true
        }
    },
    data() {
        return {
            show: false,
            processing: false,
            success: false,
            error:{
                show: false,
                message: ""
            },
            validationOld: null,
            oldPassword: "",
            newPassword: "",
            checkNewPassword: null,
        }
    },
    computed: {
        ...mapGetters({
            accessToken: "session/accessToken"
        }),
        validation() {
            return this.validationOld && this.newPassword.length > 0 && this.checkNewPassword
        }
    },
    watch: {
        value(val) {
            this.show = val
        },
        show(vl) {
            this.$emit("input", vl)
            if (!vl) {
                this.$socket.off("check:old-password:result",this._onCheckOldPassword.bind(this))
                this.oldPassword = ""
                this.newPassword = ""
                this.validationOld = null
                this.checkNewPassword = null
            } else {
                this.$socket.on("check:old-password:result", this._onCheckOldPassword.bind(this))
            }
        },
        processing(val) {
            if (val) this.error = { show: false, message: "" }
        }
    },
    methods: {
        _onCheckOldPassword(res) {
            console.debug("Old password is correct: ", res)
            this.validationOld = res
        },
        checkOldPassword() {
            if (this.oldPassword?.trim()?.length) this.$socket.emit("check:old-password", this.oldPassword)
        },
        close() {
            console.debug("close change password modal  ...")
            this.$emit("close")
        },
        change(e) {
            e.preventDefault()
            console.debug("Change password ...")
            this.processing = true
            this.$store.dispatch("users/update-password",{ oldPassword: this.oldPassword, newPassword: this.newPassword })
                .then(({ data }) => {
                    console.debug(data)
                    this.$emit("onChangePassword", data)
                    this.$socket.emit("user:update:password")
                    this.show = false
                })
                .catch(err => {
                    let message = this.$store.$api.errorsHandler.users.changePassword(err)
                    if (message) this.error = { show: true, message }
                })
                .then(() => this.processing = false)
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
