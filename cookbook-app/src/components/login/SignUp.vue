<template>
    <div id="signup-card">
      <b-alert variant="danger" v-model="error.show">{{error.msg}}</b-alert>
      <b-alert variant="success" v-model="success" class="text-center" centered>
        <p>Registrazione avvenuta correttamente.</p>
        <p>Riceverai un'email di verifica a breve.</p>
      </b-alert>
      <wrap-loading v-model="processing">
        <b-card-body class="primary-body">
          <b-card v-if="showInformation">
            <b-card-header>
              <h3>Informazioni personali</h3>
            </b-card-header>
            <b-card-body>

              <b-form-group
                  id="input-group-0"
                  label-for="input-0"
                  label="Immagine Profilo" label-sr-only
              >
                <preview-uploader avatar zoomable id="input-0"
                    @selectFile="user.img=$event"
                    @cancelSelectFile="user.img=null"
                />
              </b-form-group>
              <b-row cols-md="2" cols-sm="1" cols="1">

                <b-form-group
                    id="input-group-1"
                    label="Nome *"
                    label-for="input-1"
                    class="pr-md-2"
                >
                  <b-form-input
                      id="input-1"
                      v-model.trim="user.firstname"
                      type="text"
                      placeholder="Enter firstname"
                      @input="validation.firstName = $event.length>0"
                      :state="validation.firstName"
                      required
                  ></b-form-input>
                </b-form-group>
                <b-form-group
                    id="input-group-2"
                    label="Cognome *"
                    label-for="input-2"
                >
                  <b-form-input
                      id="input-2"
                      v-model.trim="user.lastname"
                      type="text"
                      placeholder="Enter lastname"
                      @input="validation.lastName = $event.length>0"
                      :state="validation.lastName"
                      required
                  ></b-form-input>
                </b-form-group>


                <b-form-group
                    id="input-group-3"
                    label="Email *"
                    label-for="input-3"
                    class="pr-md-2"
                >
                  <b-form-input
                      id="input-3"
                      v-model.trim="user.email"
                      type="email"
                      placeholder="Enter email"
                      @input="checkEmail"
                      :state="validation.email"
                      required
                  ></b-form-input>
                </b-form-group>
                <b-form-group
                    id="input-group-4"
                    label="Numero di telefono"
                    label-for="input-4"
                >
                  <b-form-input
                      id="input-4"
                      v-model.trim="user.tel_number"
                      type="tel"
                      placeholder="Enter telephone number"
                  ></b-form-input>
                </b-form-group>

                <b-form-group
                    id="input-group-5"
                    label="Data di nascita"
                    label-for="input-5"
                    class="pr-md-2"
                >
                  <b-form-input
                      id="input-5"
                      v-model.trim="user.birth_date"
                      type="date"
                      placeholder="Enter date of birth"
                  ></b-form-input>
                </b-form-group>
                <b-form-group
                    id="input-group-6"
                    label="Genere"
                    label-for="input-6"
                >

                  <select-with-image
                      id="input-6"
                      v-model="user.sex"
                      placeholder="Select gender"
                      type="text"
                      :options="optionsGender">
                  </select-with-image>
                </b-form-group>

                <b-form-group
                    id="input-group-7"
                    label="Stato"
                    label-for="input-7"
                    class="pr-md-2"
                >
                  <select-with-image
                      id="input-7"
                      v-model="user.country"
                      placeholder="Select country"
                      type="text"
                      :options="optionsCountry">
                  </select-with-image>
                </b-form-group>
                <b-form-group
                    id="input-group-8"
                    label="Occupazione"
                    label-for="input-8"
                >
                  <b-form-input
                      id="input-8"
                      v-model.trim="user.occupation"
                      type="text"
                      placeholder="Enter occupation"
                  ></b-form-input>
                </b-form-group>

              </b-row>
            </b-card-body>
          </b-card>

          <b-card v-if="showCredentials">
            <b-card-header>
              <h3>Credenziali di accesso</h3>
            </b-card-header>
            <b-card-body>
              <b-form-group
                  id="input-group-9"
                  label="UserID *"
                  label-for="input-9"
                  class="pr-md-2"
              >
                <b-form-input
                    id="input-9"
                    v-model.trim="user.userID"
                    type="text"
                    placeholder="Enter userID"
                    @input="validation.userID=$event.length>0"
                    :state="validation.userID"
                    required
                ></b-form-input>
              </b-form-group>

              <input-password @inputPassword="user.hash_password=$event" @checkPassword="validation.check_password=$event"/>

            </b-card-body>
          </b-card>
        </b-card-body>
        <b-card-footer v-if="!success" class="primary-footer">
          <p>* = campi obbligatori</p>
          <b-container fluid >
            <b-row :class="{'d-flex': true,  'justify-content-between': showCredentials, 'justify-content-end': showInformation}">
              <b-button v-if="showCredentials" @click="back" variant="secondary">Indietro</b-button>
              <b-button v-if="validationInformation && showInformation" @click="forward" variant="primary">Avanti</b-button>
              <b-button v-if="validationInformation && validationCredentials && showCredentials" @click="onSubmit" variant="primary">Regitrati</b-button>
            </b-row>
          </b-container>
        </b-card-footer>
      </wrap-loading>
    </div>
</template>

<script>
import api from '@api'
import configuration from "@app/app.config.json";
import {EmailValidator} from '@app/modules/validator'
import InputPassword from "../input-password";
import {Countries, Genders} from '@services/app'
export default {
  name: "sign-up",
  components: {InputPassword},
  data: function() {
    return {
      optionsGender: Genders.get(),
      optionsCountry: Countries.get(),
      app_name: configuration.app_name,
      user:{
        img: new File([], "", undefined),
        firstname: '',
        lastname: '',
        email: '',
        tel_number: '',
        birth_date: '',
        sex: '',
        country: '',
        occupation: '',
        userID: '',
        hash_password: '',
      },
      processing: false,
      error: {
        show: false,
        msg: ''
      },
      success: false,
      validation:{
        firstName: null,
        lastName: null,
        email: null,
        userID: null,
        check_password: null,
      },
      showCredentials: false,
      showInformation: true
    }
  },
  computed:{
    validationInformation: function (){
      return this.validation.firstName && this.validation.lastName && this.validation.email
    },
    validationCredentials: function (){
      return this.validation.userID && this.user.hash_password.length>0 && this.validation.check_password
    }
  },
  methods: {
    forward: function (){
      this.showCredentials = true
      this.showInformation = false
    },
    back: function (){
      this.showCredentials = false
      this.showInformation = true
    },

    checkEmail: function (email){
      this.validation.email = EmailValidator.check(email)
    },


    signup: function (){
      console.log('signup')
      const formData = new FormData()
      Object.entries(this.user)
            .filter(([k,v]) => (v && v.length > 0) || (v instanceof File && v.size >0))
            .forEach(([k, v]) => formData.append(k, v))
      //for(const [k, v] of formData.entries()) console.log(k, ' -> ', v);

      this.processing = true
      api.users.signup(formData).then(r =>{
        this.success = true
        this.error = {
          show: false,
          msg: ''
        }
        this.showCredentials = false
      }).catch(err => {
        this.error.show = true
        this.error.msg = api.users.HandlerErrors.signUp(err)
      }).then(() => this.processing=false)
    },

    onSubmit: function (event){
      event.preventDefault()
      this.signup();
    }
  }

}
</script>

<style lang="scss" scoped>

#signup-card {
  .primary-footer{
    background-color: white;
    margin-top: 1.25rem;
  }
  .primary-body{
    padding: 0
  }
}

</style>