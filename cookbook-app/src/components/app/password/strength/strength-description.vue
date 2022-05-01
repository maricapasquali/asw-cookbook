<template>
  <div>
    <slot name="title"> <span>{{title}}</span> </slot>
    <ul>
      <li :class="{'text-through': checking.atLeastMinLength}"> minimo {{ strength.minimumLength }} caratteri </li>
      <li v-if="strength.minimumLowerCase" :class="{'text-through': checking.atLeastLowercase}"> minimo {{ strength.minimumLowerCase }} minuscole </li>
      <li v-if="strength.minimumUpperCase" :class="{'text-through': checking.atLeastUppercase}"> minimo {{ strength.minimumUpperCase }} maiuscole </li>
      <li v-if="strength.minimumDigit" :class="{'text-through': checking.atLeastNumber}"> minimo {{ strength.minimumDigit }} numeri </li>
      <li v-if="strength.minimumSpecialChar" :class="{'text-through': checking.atLeastSpecialChar}"> minimo {{ strength.minimumSpecialChar }} caratteri speciali </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "strength-description",
  props: {
    strength: {
      name: String,
      minimumLength: Number,
      minimumLowerCase: Number,
      minimumUpperCase: Number,
      minimumDigit: Number,
      minimumSpecialChar: Number,

      required: true
    },
    password: String,
    title: String
  },
  data(){
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
    password(v){
      this.check(v)
    }
  },
  methods: {
    check(val){
      this.checking.atLeastLength = val ? this.strength.length(val) : false
      this.checking.atLeastLowercase = val ? this.strength.lowercase(val) : false
      this.checking.atLeastUppercase = val ? this.strength.uppercase(val) : false
      this.checking.atLeastNumber = val ? this.strength.digit(val) : false
      this.checking.atLeastSpecialChar = val ? this.strength.specialChars(val) : false
    }
  },
  created() {
    this.check(this.password)
  }
}
</script>

<style scoped>

</style>