<template>
  <b-form>
    <b-form-group
      id="input-group-10"
      label="Password *"
      label-for="new-password"
    >
      <template #label>
        <b-row>
          <b-col><span>Password *</span></b-col>
          <b-col class="text-right">
            <b-icon-info-circle-fill
              id="info-password"
              class="icon"
            />
            <b-popover
              target="info-password"
              title="Password"
              triggers="hover"
            >
              <b-row cols="1">
                <b-col
                  v-for="strength in passwordStrengths_"
                  :key="strength.name"
                >
                  <b-button
                    v-b-toggle="strength.id"
                    class="w-100 mb-1"
                    variant="primary"
                  >
                    <strong> {{ strength.name | capitalize }} </strong>
                  </b-button>
                  <b-collapse
                    :id="strength.id"
                    accordion="strength-accordion"
                  >
                    <strength-description :strength="strength" />
                  </b-collapse>
                </b-col>
              </b-row>
            </b-popover>
          </b-col>
        </b-row>
      </template>

      <input-password-switch-visibility
        id="new-password"
        v-model="password_"
        :state="validationPassword"
        placeholder="Enter password"
        required
      />
      <b-form-invalid-feedback :state="validation.diffOld">
        Inserisci una password diversa dalla vecchia
      </b-form-invalid-feedback>

      <password-strength-bar
        v-model="password_"
        class="mt-2"
        with-invalid-feedback
        @onCheck="onCheckStrength"
      />
    </b-form-group>
    <b-form-group
      id="input-group-11"
      label="Conferma password *"
      label-for="confirm-password"
    >
      <input-password-switch-visibility
        id="confirm-password"
        v-model="checkerPassword_"
        :state="validation.check_password"
        placeholder="Enter password"
        required
        @input="compare($event)"
      />
    </b-form-group>
  </b-form>
</template>

<script>
import * as bcryptjs from "bcryptjs"

export default {
    name: "FormInputsPassword",
    filters: {
        capitalize(text) {
            if (!text) return text
            return text.capitalize()
        },
    },
    props:{
        old: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            password_: "",
            checkerPassword_: "",
            passwordStrengths_: [],

            hash_password: "",

            validation:{
                password: null,
                check_password: null,
                diffOld: null,
            }
        }
    },
    computed: {
        validationPassword() {
            return this.validation.password && this.validation.diffOld
        }
    },
    watch: {
        old(val) {
            if (this.password_?.length) this.checkOldPassword(this.password_, val)
        }
    },
    created() {
        this.passwordStrengths_ = PasswordValidator.passwordStrengths
            .filter(strength => strength !== PasswordValidator.WEAK)
            .map(strength => ({ ...strength, id: strength.name + "-strength-password" }))
    },
    methods:{
        checkOldPassword(newPass, oldPass) {
            if (!oldPass) this.validation.diffOld = true
            else if (oldPass.length) {
                this.validation.diffOld = newPass !== oldPass
                console.debug("New Password is " + (this.validation.diffOld ? "DIFFERENT from " : "the SAME as")  + " the old one.")
            }
            this.hash_password = this.validation.diffOld ? bcryptjs.hashSync(newPass, bcryptjs.genSaltSync(10)) : ""
        },

        onCheckStrength({ password, validation, strength }) {
            console.debug("[onCheckStrength]: validation => ", validation, " strength => ", strength)
            this.validation.password = validation

            console.debug("validation password = ",this.validation.password)

            if (this.validation.check_password !== null) this.compare(this.checkerPassword_)

            if (this.validation.password) {
                this.checkOldPassword(password, this.old)
            } else {
                this.hash_password = ""
                this.validation.diffOld = null
            }
            this.$emit("inputPassword", this.hash_password)
        },

        compare(pass) {
            this.validation.check_password = (pass === this.password_)
            console.debug("compare  = ", this.validation.check_password)
            this.$emit("checkPassword", this.validation.check_password)
        },
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
