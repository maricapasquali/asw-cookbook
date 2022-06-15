<template>
  <center-container>
    <template #content>
      <!-- LOGIN -->
      <wrap-loading v-model="onLogin.processing">
        <b-card>
          <div class="text-center">
            <logo />
          </div>
          <b-card-body>
            <b-alert
              v-model="onLogin.error.show"
              :variant="onLogin.error.info? 'info': 'danger'"
            >
              {{ onLogin.error.msg }}
            </b-alert>
            <b-form @submit.prevent="onLoginSubmit">
              <b-form-group
                id="input-group-1"
                label="UserID"
                label-for="input-1"
              >
                <b-form-input
                  id="input-1"
                  v-model.trim="credential.userID"
                  :state="validationUserID"
                  type="text"
                  placeholder="Enter userID"
                  required
                  @input="checkUserID"
                />
              </b-form-group>
              <b-form-group
                id="input-group-password"
                label="Password"
                label-for="input-password"
              >
                <input-password-switch-visibility
                  id="input-password"
                  v-model.trim="credential.password"
                  :state="validationPassword"
                  placeholder="Enter password"
                  required
                  @input="checkPassword"
                />
                <b-form-invalid-feedback :state="validationPassword">
                  La password deve avere almeno 5 caratteri
                </b-form-invalid-feedback>
              </b-form-group>

              <b-container>
                <b-row
                  cols="1"
                  cols-md="2"
                  class="d-flex justify-content-between"
                >
                  <b-col class="pl-0">
                    <b-button
                      id="forgot-password"
                      class="pl-0"
                      variant="link"
                      @click="showModalResetPassword"
                    >
                      Password dimenticata?
                    </b-button>
                  </b-col>
                  <b-col
                    v-if="validationUserID && validationPassword"
                    class="pr-0 text-right"
                  >
                    <b-button
                      variant="primary"
                      type="submit"
                      class="mb-2"
                    >
                      Accedi
                    </b-button>
                  </b-col>
                </b-row>
                <div class="text-center">
                  <b-button
                    id="signup"
                    class="pl-0"
                    variant="link"
                    @click="showSignUp=true"
                  >
                    Non hai ancora un'account?
                  </b-button>
                </div>
              </b-container>
            </b-form>
          </b-card-body>
        </b-card>
      </wrap-loading>

      <!-- RESET PASSWORD -->
      <b-modal
        v-model="resetPassword.show"
        centered
        title="Richiesta Reset Password"
        :hide-footer="(!resetPassword.showSend && !resetPassword.success ) || resetPassword.processing"
        @hidden="resetModalResetPassword"
      >
        <template #modal-header-close />

        <wrap-loading v-model="resetPassword.processing">
          <b-alert
            v-model="resetPassword.error.show"
            variant="danger"
          >
            {{ resetPassword.error.msg }}
          </b-alert>
          <b-alert
            v-model="resetPassword.success"
            variant="success"
          >
            E' stata inviata un email con un link per il reset della password.
          </b-alert>
          <b-container
            fluid
            class="py-2"
          >
            <b-form-group
              id="input-group-3"
              label="E-mail"
              label-for="input-3"
            >
              <b-form-input
                id="input-3"
                v-model.trim="resetPassword.email"
                :state="validationEmail"
                type="email"
                placeholder="Enter email"
                required
                @input="checkEmail"
              />
              <b-form-invalid-feedback :state="validationEmail">
                Email non è valida.
              </b-form-invalid-feedback>
            </b-form-group>
          </b-container>
        </wrap-loading>
        <template #modal-footer="{ok}">
          <div
            v-show="resetPassword.showSend"
            slot="modal-ok"
          >
            <b-button
              type="submit"
              variant="primary"
              @click="sendLinkResetPassword"
            >
              Invia
            </b-button>
          </div>

          <div
            v-show="resetPassword.success"
            slot="modal-ok"
          >
            <b-button
              type="submit"
              variant="primary"
              @click="closeModalResetPassword(ok)"
            >
              Ok
            </b-button>
          </div>
        </template>
      </b-modal>

      <!-- SIGNUP -->
      <b-modal
        v-model="showSignUp"
        centered
        title="Crea un account"
        hide-footer
        no-close-on-backdrop
      >
        <sign-up />
      </b-modal>
    </template>
  </center-container>
</template>

<script>
import { mapActions } from "vuex"

export default {
    name: "Login",
    data() {
        return {
            credential: {
                userID: "",
                password: ""
            },

            validationUserID: null,
            validationPassword: null,
            validationEmail: null,
            onLogin: {
                processing: false,
                error: { show: false, msg:"", info: false }
            },
            resetPassword:{
                processing: false,
                show: false,
                showSend: false,
                email: "",
                success: false,
                error: {
                    show: false,
                    msg: ""
                },
            },
            showSignUp: false
        }
    },
    watch: {
        "resetPassword.processing"(val) {
            if (val) this.resetPassword.error = { show: false, msg: "" }
        },
        "onLogin.processing"(val) {
            if (val) this.onLogin.error = { show: false, msg: "", info: false }
        }
    },
    methods: {
        ...mapActions({
            login: "session/login"
        }),

        // VALIDATION
        checkUserID() {
            this.validationUserID = this.credential.userID.length > 0
        },

        checkPassword() {
            this.validationPassword = this.credential.password.length > 4
        },

        checkEmail() {
            const valid = EmailValidator.check(this.resetPassword.email)
            this.resetPassword.showSend = valid
            this.validationEmail = valid
        },

        //MODAL
        showModalResetPassword() {
            this.resetPassword.show = true
        },

        closeModalResetPassword(ok) {
            if (isCallable(ok)) ok()
            this.resetPassword = {
                show: false,
                showSend: false,
                email: "",
                success: false,
                error: {
                    show: false,
                    msg: ""
                },
            }
        },

        resetModalResetPassword() {
            this.closeModalResetPassword()
            this.validationEmail = null
        },

        //REQUEST
        sendLinkResetPassword(event) {
            event.preventDefault()
            this.resetPassword.processing = true
            this.$store.dispatch("users/reset-password/request", this.resetPassword.email)
                .then(() => {
                    this.resetPassword.success = true
                    this.resetPassword.showSend = false
                })
                .catch(err => {
                    this.resetPassword.error.show = true
                    this.resetPassword.error.msg = this.$store.$api.errorsHandler.users.emailResetPassword(err)
                })
                .finally(() => this.resetPassword.processing = false)
        },

        onLoginSubmit() {
            this.onLogin.processing = true
            this.login(this.credential)
                .then(({ location, session }) => {
                    console.debug("LOCATION ", location)
                    this.$router.replace(location)
                    this.$broadcastChannel.postMessage({ login: session })
                    console.debug("Store state: ", this.$store.state)
                })
                .catch(err => {
                    this.onLogin.error.show = true
                    this.onLogin.error.info = err.response?.status === 409
                    this.onLogin.error.msg = this.$store.$api.errorsHandler.session.login(err)
                })
                .then(() => this.onLogin.processing = false)
        }
    }
}
</script>

<style scoped>
#forgot-password:focus,
#signup:focus {
  box-shadow: none !important;
}

/deep/ input {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
</style>
