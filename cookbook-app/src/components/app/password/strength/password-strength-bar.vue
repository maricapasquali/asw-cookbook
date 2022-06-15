<template>
  <div>
    <b-progress
      id="strength-progress-bar"
      class="my-2"
      :max="maxStrengthPassword"
    >
      <b-progress-bar
        :value="strength_.value"
        :variant="_variant"
        :label="strength_.label"
      />
    </b-progress>

    <b-form-invalid-feedback
      v-if="withInvalidFeedback"
      :state="validation_"
    >
      <strength-description
        title="Password deve contenere"
        :strength="minimalStrengthValid"
        :password="value_"
      />
    </b-form-invalid-feedback>
  </div>
</template>

<script>

export default {
    name: "PasswordStrengthBar",
    props: {
        value: {
            type: String,
            required: true
        },
        maxStrength: {
            type: Number,
            default: 100
        },
        withInvalidFeedback: Boolean
    },
    data() {
        return {
            strength_: {
                value: null,
                label: null
            },
            validation_: null,
            value_: ""
        }
    },

    computed: {

        minimalStrengthNotValid() {
            return PasswordValidator.WEAK
        },

        minimalStrengthValid() {
            return PasswordValidator.GOOD
        },

        maxStrengthPassword() {
            return this.maxStrength || 100
        },

        _variant() {
            return this.strength_.label + "-password"
        }
    },
    watch: {
        value(v) {
            this.checkStrength(v)
        }
    },
    created() {
        this.strength_.label = this.minimalStrengthNotValid.name
        if (this.value) this.checkStrength(this.value)
    },
    methods: {
        checkStrength(password) {
            console.debug("Check strength ... ")

            this.value_ = password

            let actualStrength = PasswordValidator.strength(password)

            this._setActualStrength(actualStrength)

            this.validation_ = actualStrength ? actualStrength !== this.minimalStrengthNotValid : null

            this.$emit("onCheck", { password, validation: this.validation_, strength: actualStrength?.name })
        },

        _setActualStrength(actualStrength) {
            this.strength_.label = actualStrength?.name || this.minimalStrengthNotValid.name
            switch (actualStrength) {
                case PasswordValidator.WEAK:
                    this.strength_.value = 25
                    break
                case PasswordValidator.GOOD:
                    this.strength_.value = 50
                    break
                case PasswordValidator.MEDIUM:
                    this.strength_.value = 75
                    break
                case PasswordValidator.STRONG:
                    this.strength_.value = 100
                    break
                default:
                    this.strength_.value = null
            }
        }
    }
}
</script>

<style lang="scss" scoped>
  .bg-weak-password {
    background-color: $danger;
  }

  .bg-good-password {
    background-color: $orange;
  }

  .bg-medium-password {
    background-color: $warning;
  }

  .bg-strong-password {
    background-color: $success;
  }
</style>
