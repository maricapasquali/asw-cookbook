<template>
  <div>
    <b-form-group
        id="input-group-10"
        label="Password *"
        label-for="input-10"
        class="pr-md-2"
    >
      <b-form-input
          id="input-10"
          @input="hashFunc($event)"
          :state="validationPassword"
          type="password"
          placeholder="Enter password"
          ref="password"
          required
      ></b-form-input>
      <b-form-invalid-feedback :state="validation.password">
        <div v-if="!validation.password">
          Password deve contenere almeno 8 caratteri e minimo
          <ul>
            <li>1 Maiuscolo</li>
            <li>1 Minuscolo</li>
            <li>1 Numero</li>
            <li>1 carattere speciale</li>
          </ul>
        </div>
        <div v-else-if="!diffOld">
          Inserisci una password diversa dalla vecchia
        </div>
      </b-form-invalid-feedback>
    </b-form-group>
    <b-form-group
        id="input-group-11"
        label="Conferma password *"
        label-for="input-11"
    >
      <b-form-input
          id="input-11"
          :state="validation.check_password"
          @input="compare($event)"
          type="password"
          placeholder="Enter password"
          ref="check_password"
          required
      ></b-form-input>
    </b-form-group>
  </div>
</template>

<script>
import * as bcryptjs from "bcryptjs";

export default {
  name: "input-password",
  props:{
    old: {
      type: String,
      default: null
    }
  },
  data: function (){
    return {
      hash_password: '',
      validation:{
        password: null,
        check_password: null,
      },
      diffOld: null
    }
  },
  computed: {
    validationPassword: function (){
      return this.validation.password && this.diffOld
    }
  },
  methods:{
    hashFunc: function (password){
      this.validation.password = PasswordValidator.check(password)

      if(this.validation.check_password !== null) this.compare(this.$refs.check_password.$el.value)
      console.debug("validation  = ",this.validation.password, ", diff old = ", this.diffOld)

      if(this.validation.password){
        this.diffOld = password !== this.old
        console.debug("Diff old = ", this.diffOld )
        if(this.diffOld){
          let salt = bcryptjs.genSaltSync(10)
          this.hash_password = bcryptjs.hashSync(password,salt)
        }
      }else{
        this.hash_password = ''
        this.diffOld = null
      }
      this.$emit('inputPassword', this.hash_password)
    },
    compare: function (pass){
      this.validation.check_password = (pass === this.$refs.password.$el.value)
      console.debug("compare  = ", this.validation.check_password)
      this.$emit('checkPassword', this.validation.check_password)
    },
  }
}
</script>

<style scoped>

</style>