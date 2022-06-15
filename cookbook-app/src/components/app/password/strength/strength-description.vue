<template>
  <div>
    <slot name="title">
      <span>{{ title }}</span>
    </slot>
    <ul>
      <li :class="{'text-through': checking.atLeastMinLength}">
        minimo {{ strength.minimumLength }} caratteri
      </li>
      <li
        v-if="strength.minimumLowerCase"
        :class="{'text-through': checking.atLeastLowercase}"
      >
        minimo {{ strength.minimumLowerCase }} minuscole
      </li>
      <li
        v-if="strength.minimumUpperCase"
        :class="{'text-through': checking.atLeastUppercase}"
      >
        minimo {{ strength.minimumUpperCase }} maiuscole
      </li>
      <li
        v-if="strength.minimumDigit"
        :class="{'text-through': checking.atLeastNumber}"
      >
        minimo {{ strength.minimumDigit }} numeri
      </li>
      <li
        v-if="strength.minimumSpecialChar"
        :class="{'text-through': checking.atLeastSpecialChar}"
      >
        minimo {{ strength.minimumSpecialChar }} caratteri speciali
      </li>
    </ul>
  </div>
</template>

<script>
export default {
    name: "StrengthDescription",
    props: {
        strength: {
            type: Object,
            required: true,
            validator(val) {
                let keys = ["minimumLength", "minimumLowerCase", "minimumUpperCase", "minimumDigit", "minimumSpecialChar"]
                return Object.keys(val).some(k => keys.includes(k)) &&
                       Object.entries(val)
                           .filter(([k,]) => keys.includes(k))
                           .every(([, v]) => isNumber(v))
            }
        },
        password: {
            type: String,
            default: ""
        },
        title: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            checking: {
                atLeastMinLength: false,
                atLeastLowercase: false,
                atLeastUppercase: false,
                atLeastNumber: false,
                atLeastSpecialChar: false,
            }
        }
    },
    watch: {
        password(v) {
            this.check(v)
        }
    },
    created() {
        this.check(this.password)
    },
    methods: {
        check(val) {
            this.checking.atLeastLength = val ? this.strength.length(val) : false
            this.checking.atLeastLowercase = val ? this.strength.lowercase(val) : false
            this.checking.atLeastUppercase = val ? this.strength.uppercase(val) : false
            this.checking.atLeastNumber = val ? this.strength.digit(val) : false
            this.checking.atLeastSpecialChar = val ? this.strength.specialChars(val) : false
        }
    }
}
</script>

<style scoped>

</style>
