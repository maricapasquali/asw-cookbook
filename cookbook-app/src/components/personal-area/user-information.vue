<template>
  <div>
    <b-container class="p-0" fluid>
      <div v-if="personalArea && changeMode">
        <wrap-loading v-model="processing">
          <template>
            <b-form-group label-for="input-image-profile" label="Immagine Profilo" label-sr-only>
              <preview-uploader avatar id="input-image-profile"
                  :default="oldProfileImage"
                  @selectFile="changeableUser.information.img = $event"
                  @cancelSelectFile="changeableUser.information.img = oldProfileImage"
                  zoomable
                  removable/>
            </b-form-group>

            <b-form-group label-for="input-country">
              <template #label> <b>Paese</b> </template>
              <select-with-image id="input-country" placeholder="Seleziona paese ..." v-model="changeableUser.information.country" :options="countries"></select-with-image>
            </b-form-group>

            <b-form-group label-for="input-name">
              <template #label> <b>Nome *</b> </template>
              <b-form-input id="input-name" type="text" :state="validation.firstname" v-model="changeableUser.information.firstname" @input="checkRequiredField($event, 'firstname')"></b-form-input>
            </b-form-group>

            <b-form-group label-for="input-lastname">
              <template #label> <b>Cognome *</b> </template>
              <b-form-input id="input-lastname" type="text" :state="validation.lastname" v-model="changeableUser.information.lastname" @input="checkRequiredField($event, 'lastname')"></b-form-input>
            </b-form-group>

            <b-form-group label-for="input-birth-date">
              <template #label> <b>Data di nascita</b> </template>
              <b-form-input id="input-birth-date" type="date" v-model="changeableUser.information.birth_date"></b-form-input>
            </b-form-group>

            <b-form-group label-for="input-gender">
              <template #label> <b>Genere</b> </template>
              <select-with-image id="input-gender" placeholder="Seleziona genere ..." v-model="changeableUser.information.sex" :options="genders"></select-with-image>
            </b-form-group>

            <b-form-group label-for="input-occupation">
              <template #label> <b>Occupazione</b> </template>
              <b-form-input id="input-occupation" type="text" v-model="changeableUser.information.occupation"></b-form-input>
            </b-form-group>

            <div>
              <b>Contatti</b>
              <ul>
                <li>
                  <b-form-group label-for="input-email">
                    <template #label> <b>Email *</b> </template>
                    <b-form-input id="input-email" type="email" :state="validation.email" v-model="changeableUser.information.email" @input="checkRequiredField($event, 'email')"></b-form-input>
                  </b-form-group>
                </li>
                <li>
                  <b-form-group label-for="input-tel-num">
                    <template #label> <b>Numero di telefono</b> </template>
                    <b-form-input id="input-tel-num" type="tel" v-model="changeableUser.information.tel_number"></b-form-input>
                  </b-form-group>
                </li>
              </ul>
            </div>

            <b-row align-h="between">
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
              <avatar v-model="user.information.img" variant="light" :user="user._id"/>
            </b-col>
            <b-col align-self="center" class="d-flex justify-content-end">
              <country-image id="owner" v-model="user.information.country" width="100" height="70" />
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
            <b-col  v-if="personalArea" align-self="end" class="d-flex justify-content-end px-0">
              <b-button-group vertical>
                <b-button v-if="!changeMode" variant="secondary" @click="changeMode = true"> Modifica </b-button>
                <b-button v-if="user.isSigned && !user.isAdmin" variant="secondary" @click="changeUserID=true"> Cambia userID </b-button>
                <b-button variant="secondary"  @click="changePassword=true"> Cambia password </b-button>
                <b-button v-if="user.isSigned && !user.isAdmin" variant="secondary" @click="deleteAccount=true"> Cancella Account </b-button>
              </b-button-group>
            </b-col>
            <b-col  v-else-if="isLoggedIn && isOtherUser" align-self="end" class="d-flex justify-content-end px-0">
              <b-button-group vertical>
                <b-friendship :other-user="user" with-chat/>
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
    <delete-account v-model="deleteAccount" :id="user._id" @sessionExpired="onSessionExpired"/>
    <!-- CHANGE PASSWORD -->
    <change-password v-if="changePassword" @close="changePassword=false" :id="user._id" @sessionExpired="onSessionExpired"/>
    <!-- CHANGE USERID-->
    <change-userid v-if="changeUserID" @close="changeUserID=false" @sessionExpired="onSessionExpired"
                   :id="user._id" :old_userID="user.userID" @changeUserID="onChangeUserID"/>

  </div>
</template>

<script>
import {bus} from "@/main";
import api from '@api'
import {EmailValidator} from '@app/modules/validator'
import {clone, equals, isString} from "@services/utils"

import {Countries, Genders} from '@services/app'
import {mapGetters} from "vuex";

export default {
  name: "user-information",
  props:{
    id: String,
    personalArea: {
      type: Boolean,
      default: false
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
      error: {
        show: false,
        message: ''
      }
    }
  },
  created() {
    console.log(`CREATE GUI INFO USER (${this.id})...`)
    this.getUser()

    bus.$on('user:update:info', this.onUpdateInfos.bind(this))
  },
  beforeDestroy() {
    bus.$off('user:update:info', this.onUpdateInfos.bind(this))
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
    ...mapGetters(['userIdentifier', 'isAdmin', 'isSigned', 'accessToken', 'isLoggedIn', 'userFriends', 'socket']),

    oldProfileImage(){
      return this.user.information.img
    },

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
      return this.userIdentifier !== this.id
    }
  },
  methods:{

    getUser(_id){
      api.users
         .getUser(_id || this.id, this.accessToken)
         .then(({data}) =>{
            this.user = data
            this.changeableUser = clone(this.user)
            console.log(this.user)
            console.log(this.changeableUser)
         })
         .catch(err => {
            if(err.response && err.response.status === 404) this.$emit('not-found')
            else {
              this.error.show = true
              this.error.message = api.users.HandlerErrors.getUser(err)
            }
            console.error(err)
         })
    },

    onSessionExpired: function (){
      this.$emit('onSessionExpired')
    },
    onChangeUserID: function(val){
      this.user.userID = val
      this.changeUserID = false
      this.$store.commit('changeUserId', val)
    },

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
        for(let [k, v] of formData.entries()) console.debug(k, " = ", v)

        api.users
           .updateUserInfo(this.id, formData, this.accessToken).then(response => {
              console.log(response.data)
              this.changeMode = false;
              this.user.information = response.data.info

              this.socket.emit('user:update:info', { _id: this.id, information: response.data.info } )

           })
           .catch(err => {
              this.error.message = api.users.HandlerErrors.updateUser(err)
              if(isString(this.error.message)){
                this.error.show = true
              }else if(err.response.status === 401){
                //this.$router.replace({ name: 'login' })
                this.onSessionExpired()
              }
           })
           .finally(() => {
              this.processing = false
              this.changeableUser.information = clone(this.user.information)
           })
      }
    },

    /* Listeners update */
    onUpdateInfos(userInfo){

      if(!this.personalArea && userInfo && this.id === userInfo._id) {
        if(userInfo.information) {
          this.user.information = userInfo.information
          this.changeableUser.information = clone(this.user.information)
        }
        if(userInfo.userID) {
          this.user.userID = userInfo.userID
          this.changeableUser.userID = userInfo.userID
        }
      }

    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .accept-request{
  background-color: #f8f9fa;
  border-color: #f8f9fa;
  color: $component-color;
}
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