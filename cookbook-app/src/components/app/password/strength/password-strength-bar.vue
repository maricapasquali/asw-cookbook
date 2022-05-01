<template>
  <div>
    <b-progress id="strength-progress-bar" class="my-2" :max="maxStrengthPassword">
      <b-progress-bar :value="$data._strength.value" :variant="_variant" :label="$data._strength.label" />
    </b-progress>

    <b-form-invalid-feedback v-if="withInvalidFeedback" :state="$data._validation">
      <strength-description title="Password deve contenere" :strength="minimalStrengthValid" :password="$data._value" />
    </b-form-invalid-feedback>
  </div>
</template>

<script>

export default {
  name: "password-strength-bar",
  props: {
    value: String,
    maxStrength: Number,
    withInvalidFeedback: Boolean
  },
  data(){
    return {
      _strength: {
        value: null,
        label: null
      },
      _validation: null,
      _value: ""
    }
  },

  computed: {

    minimalStrengthNotValid(){
      return PasswordValidator.WEAK
    },

    minimalStrengthValid(){
      return PasswordValidator.GOOD
    },

    maxStrengthPassword(){
      return this.maxStrength || 100
    },

    _variant(){
      return this.$data._strength.label + '-password'
    }
  },
  methods: {
    checkStrength(password){
      console.debug("Check strength ... ")

      this.$data._value = password

      let actualStrength = PasswordValidator.strength(password)

      this._setActualStrength(actualStrength)

      this.$data._validation = actualStrength ? actualStrength !== this.minimalStrengthNotValid : null

      this.$emit('onCheck', { password, validation: this.$data._validation, strength: actualStrength?.name })
    },

    _setActualStrength(actualStrength){
      this.$data._strength.label = actualStrength?.name || this.minimalStrengthNotValid.name
      switch (actualStrength) {
        case PasswordValidator.WEAK:
          this.$data._strength.value = 25
          break;
        case PasswordValidator.GOOD:
          this.$data._strength.value = 50
          break;
        case PasswordValidator.MEDIUM:
          this.$data._strength.value = 75
          break;
        case PasswordValidator.STRONG:
          this.$data._strength.value = 100
          break;
        default:
          this.$data._strength.value = null
      }
    }
  },
  watch: {
    value(v){
      this.checkStrength(v)
    }
  },
  created() {
    this.$data._strength.label = this.minimalStrengthNotValid.name
    if(this.value) this.checkStrength(this.value)
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