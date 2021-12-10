<template>
  <div>
    <b-container class="p-0" fluid>
      <div v-if="changeMode">
        <wrap-loading v-model="processing">
          <template>
            <image-preview-uploader v-if="changeableUser.information.img" :default="changeableUser.information.img" @selectImage="changeImage($event)" ></image-preview-uploader>
            <image-preview-uploader v-else @selectImage="changeImage($event)"></image-preview-uploader>

            <b-form-group>
              <label for="input-country"><b>Paese</b></label>
              <select-with-image id="input-country" placeholder="Seleziona paese ..." v-model="changeableUser.information.country" :options="countries"></select-with-image>
            </b-form-group>

            <b-form-group>
              <label for="input-name"><b>Nome *</b></label>
              <b-form-input id="input-name" type="text" :state="validation.firstname" v-model="changeableUser.information.firstname" @input="checkRequiredField($event, 'firstname')"></b-form-input>
            </b-form-group>

            <b-form-group>
              <label for="input-lastname"><b>Cognome *</b></label>
              <b-form-input id="input-lastname" type="text" :state="validation.lastname" v-model="changeableUser.information.lastname" @input="checkRequiredField($event, 'lastname')"></b-form-input>
            </b-form-group>

            <b-form-group>
              <label for="input-birth-date"><b>Data di nascita</b></label>
              <b-form-input id="input-birth-date" type="date" v-model="changeableUser.information.birth_date"></b-form-input>
            </b-form-group>

            <b-form-group>
              <label for="input-gender"><b>Genere</b></label>
              <select-with-image id="input-gender" placeholder="Seleziona genere ..." v-model="changeableUser.information.sex" :options="genders"></select-with-image>
            </b-form-group>

            <b-form-group>
              <label for="input-occupation"><b>Occupazione</b></label>
              <b-form-input id="input-occupation" type="text" v-model="changeableUser.information.occupation"></b-form-input>
            </b-form-group>

            <div>
              <b>Contatti</b>
              <ul>
                <li>
                  <b-form-group>
                    <label for="input-email"><b>Email * </b></label>
                    <b-form-input id="input-email" type="email" :state="validation.email" v-model="changeableUser.information.email" @input="checkRequiredField($event, 'email')"></b-form-input>
                  </b-form-group>
                </li>
                <li>
                  <b-form-group>
                    <label for="input-tel-num"><b>Numero di telefono</b></label>
                    <b-form-input id="input-tel-num" type="tel" v-model="changeableUser.information.tel_number"></b-form-input>
                  </b-form-group>
                </li>
              </ul>
            </div>

            <b-row align-h="between" v-if="accessToken">
              <b-col class="d-flex justify-content-start"><b-button variant="secondary" @click="cancel"> Annulla </b-button></b-col>
              <b-col class="d-flex justify-content-end"><b-button v-if="isChangedSomething" variant="primary" @click="save"> Salva </b-button></b-col>
            </b-row>
          </template>
        </wrap-loading>
      </div>
      <b-container v-else fluid class="user-infos mt-2">
        <b-skeleton-wrapper :loading="isNotLoaded">
          <template #loading>
            <b-row align-h="between" class="text-center">
              <b-col class="d-flex justify-content-start">
                <b-skeleton type="avatar"></b-skeleton>
              </b-col>
            </b-row>
            <b-row cols="1" cols-sm="2">
              <b-col>
                <b-row cols="1" cols-md="2">
                  <b-col><b>UserID</b></b-col>
                  <b-col><b-skeleton width="30%"></b-skeleton></b-col>
                </b-row>
                <b-row cols="1" cols-md="2">
                  <b-col><b>Nome completo</b></b-col>
                  <b-col><b-skeleton width="50%"></b-skeleton></b-col>
                </b-row>
                <b-row cols="1" cols-md="2">
                  <b-col><b>Data di nascita</b></b-col>
                  <b-col><b-skeleton width="40%"></b-skeleton></b-col>
                </b-row>
                <b-row cols="1" cols-md="2">
                  <b-col><b>Genere</b></b-col>
                  <b-col><b-skeleton width="70%"></b-skeleton></b-col>
                </b-row>
                <b-row cols="1" cols-md="2">
                  <b-col><b>Occupazione</b></b-col>
                  <b-col><b-skeleton width="40%"></b-skeleton></b-col>
                </b-row>
                <b-row cols="1">
                  <b-col><b>Contatti</b></b-col>
                  <b-col>
                    <ul>
                      <li><b-col><b-skeleton width="50%"></b-skeleton></b-col></li>
                      <li><b-col><b-skeleton width="60%"></b-skeleton></b-col></li>
                    </ul>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
          </template>

          <b-row align-h="between" class="text-center">
            <b-col class="d-flex justify-content-start">
              <avatar v-model="user.information.img" />
            </b-col>
            <b-col align-self="center" class="d-flex justify-content-end">
              <country-image v-model="user.information.country" width="100" height="70" />
            </b-col>
          </b-row>

          <b-row cols="1" cols-sm="2">
            <b-col>
              <b-row cols="1" cols-md="2">
                <b-col><b>UserID</b></b-col>
                <b-col><p>{{ user.userID }}</p></b-col>
              </b-row>
              <b-row cols="1" cols-md="2">
                <b-col><b>Nome completo</b></b-col>
                <b-col><p>{{ user.information.firstname }} {{ user.information.lastname }}</p></b-col>
              </b-row>
              <b-row v-if="user.information.birth_date" cols="1" cols-md="2">
                <b-col><b>Data di nascita</b></b-col>
                <b-col><p>{{ user.information.birth_date | localDate(user.information.country) }}</p></b-col>
              </b-row>
              <b-row v-if="user.information.sex" cols="1" cols-md="2">
                <b-col><b>Genere</b></b-col>
                <b-col><p>{{gender}}</p></b-col>
              </b-row>
              <b-row v-if="user.information.occupation" cols="1" cols-md="2">
                <b-col><b>Occupazione</b></b-col>
                <b-col><p>{{ user.information.occupation }}</p></b-col>
              </b-row>
              <b-row v-if="user.information.email || user.information.tel_number" cols="1">
                <b-col><b>Contatti</b></b-col>
                <b-col>
                  <ul>
                    <li v-if="user.information.email">
                      <p>{{ user.information.email }}</p>
                    </li>
                    <li v-if="user.information.tel_number">
                      <p>{{ user.information.tel_number }}</p>
                    </li>
                  </ul>
                </b-col>
              </b-row>
            </b-col>
            <b-col  v-if="accessToken" align-self="end" class="d-flex justify-content-end px-0">
              <b-button-group vertical>
                <b-button v-if="!changeMode" variant="secondary" @click="changeMode = true"> Modifica </b-button>
                <b-button v-if="user.isSigned && !user.isAdmin" variant="secondary" @click="changeUserID=true"> Cambia userID </b-button>
                <b-button variant="secondary"  @click="changePassword=true"> Cambia password </b-button>
                <b-button v-if="user.isSigned && !user.isAdmin" variant="secondary" @click="deleteAccount=true"> Cancella Account </b-button>
              </b-button-group>
            </b-col>
            <b-col  v-if="isOtherUser" align-self="end" class="d-flex justify-content-end px-0">
              <b-button-group vertical>
                <b-button v-if="!friendship.request && !friendship.just" variant="secondary" @click="requestFriendShip"> Segui </b-button>
                <b-button v-else v-if="friendship.just" variant="secondary" @click="removeFriendShip">Smetti di seguire</b-button>
                <b-button v-else v-if="friendship.request && !friendship.just" variant="primary" disabled>Richiesta inviata</b-button>
                <b-button variant="secondary" @click="goChat"> Chat </b-button>
              </b-button-group>
            </b-col>
          </b-row>
        </b-skeleton-wrapper>

      </b-container>

    </b-container>
    <!-- DISPLAY ERRORS -->
    <modal-alert v-model="error.show" variant="danger" >
      <template v-slot:msg> {{error.message}} </template>
    </modal-alert>
    <!-- DELETE ACCOUNT -->
    <delete-account v-if="deleteAccount" @close="deleteAccount=false" :id="user._id" @sessionExpired="onSessionExpired"/>
    <!-- CHANGE PASSWORD -->
    <change-password v-if="changePassword" @close="changePassword=false" :id="user._id" @sessionExpired="onSessionExpired"/>
    <!-- CHANGE USERID-->
    <change-userid v-if="changeUserID" @close="changeUserID=false" @sessionExpired="onSessionExpired"
                   :id="user._id" :old_userID="user.userID" @changeUserID="onChangeUserID"/>

  </div>
</template>

<script>
import api from '@api'
import {EmailValidator} from '@app/modules/validator'
import {clone, equals, isString} from "@services/utils"
import {Session} from "@services/session"
import {bus} from "@/main";

import {Countries, Genders} from '@services/app'

export default {
  name: "user-information",
  props:{
    id: String,
    accessToken: {
      type: String,
      default: undefined
    }
  },
  data: function (){
    return {
      countries: Countries.get(),
      genders: Genders.get(),
      changeableUser: { information: {}, userID: '', _id: ''},
      user: { information: {}, userID: '', _id: ''},
      changeMode: false,
      deleteAccount: false,
      changeUserID: false,
      changePassword: false,
      validation:{
        email: true,
        firstname: true,
        lastname: true,
      },
      processing: false,
      error:{
        show: false,
        message: ''
      },
      friendship: {
        request: false,
        just: false,
      }
    }
  },
  created() {
    console.log(`CREATE GUI INFO USER (${this.id})...`)
    api.users.getUser(this.id, this.accessToken).then((response)=>{
      this.user = response.data
      this.changeableUser = clone(this.user)
      console.log(this.user)
      console.log(this.changeableUser)
    }).catch(err => {
      this.error.show = true
      this.error.message = api.users.HandlerErrors.getUser(err)
      console.error(err)
    })
  },
  filters: {
    localDate: function (text, country){
      let date = new Date(text)
      switch (country){
        case 'US':
          return date.toLocaleDateString('en-US')
        default:
          return date.toLocaleDateString()
      }
    }
  },
  computed:{
    isNotLoaded() {
      return this.user._id.length === 0;
    },
    isChangedSomething: function (){
      return !equals(this.changeableUser.information, this.user.information) &&
              Object.values(this.validation).every(v => v === true)
    },
    gender: function (){
      return Genders.find(this.user.information.sex).text
    },
    isOtherUser: function (){
      return Session.accessToken() && Session.userInfo()._id !== this.id
    }
  },
  methods:{
    onSessionExpired: function (){
      this.$emit('onSessionExpired')
    },
    onChangeUserID: function(val){
      this.user.userID = val
      this.changeUserID = false
      bus.$emit('userID', val);
    },

    changeImage: function (val){
      console.log(val)
      console.log(val instanceof File)
      // this.changeableUser.information.img = val && val.size === 0 ? this.user.information.img : val
      this.changeableUser.information.img = val || this.user.information.img
    },

    // selectCountry: function (e){
    //   console.log("select contry = ", e)
    //   this.changeableUser.information.country = e.value
    // },
    // selectGender: function (e){
    //   console.log("select gender = ", e)
    //   this.changeableUser.information.sex = e.value
    // },

    checkRequiredField: function (val, field){
      // if(val.length === 0) this.changeableUser.information[field] = this.user.information[field]

      switch (field){
        case 'firstname':{
          this.validation.firstname = this.changeableUser.information.firstname.length > 0
        }
        break;
        case 'lastname':{
          this.validation.lastname = this.changeableUser.information.lastname.length > 0
        }
        break;
        case 'email':{
          this.validation.email = EmailValidator.check(this.changeableUser.information.email)
        }
        break;
      }
    },

    cancel: function (){
      this.changeMode = false;
      this.changeableUser = clone(this.user)
    },

    save: function (){
      this.processing = true

      if(!equals(this.changeableUser.information, this.user.information)) {
        let formData = new FormData();
        Object.entries(this.changeableUser.information).filter(([k, v]) => this.user.information[k] !== v).forEach(([k, v]) => formData.append(k, v))
        for(let [k, v] of formData.entries()) console.warn(k, " = ", v)

        api.users.updateUserInfo(this.id, formData, this.accessToken).then(response => {
          console.log(response.data)
          this.changeMode = false;
          this.user.information = response.data.info
        }).catch(err => {
          this.error.message = api.users.HandlerErrors.updateUser(err)
          if(isString(this.error.message)){
            this.error.show = true
          }else if(err.response.status === 401){
            //this.$router.replace({ name: 'login' })
            this.onSessionExpired()
          }
        }).then(() => {
          this.processing = false
          this.changeableUser.information = clone(this.user.information)
        })
      }
    },

    requestFriendShip: function (){
      this.friendship.request = true
      //TODO: REQUEST FRIENDSHIP
    },
    removeFriendShip: function (){
      this.friendship.request = false
      this.friendship.just = false
      //TODO: REMOVE FRIENDSHIP
    },
    goChat: function (){
      //TODO: GO IN CHAT
    }
  }
}
</script>

<style lang="scss" scoped>
.user-infos {
  border: 1px dashed black;
  border-radius: 10px;
  background: $component-color;
  padding-top: 10px;
  color: white;
  & > div {
    padding: 10px;
    & > p {
      padding-left: 20px;
    }
  }
}
</style>