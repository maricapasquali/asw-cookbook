<template>
  <wrap-loading v-model="processing">
    <b-container>
      <b-row>
        <b-col class="text-right">
          <b-button title="Chiudi" variant="danger" @click="cancel"><font-awesome-icon icon="times" /></b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group label-for="input-image-profile" label="Immagine Profilo" label-sr-only>
            <preview-uploader avatar id="input-image-profile"
                              :default="oldProfileImage"
                              @selectFile="changeableUser.information.img = $event"
                              @cancelSelectFile="changeableUser.information.img = oldProfileImage"
                              zoomable
                              removable/>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row cols="1" cols-md="2" cols-lg="3" >
        <b-col>
          <b-form-group label-for="input-country">
            <template #label> <b>Paese</b> </template>
            <select-with-image id="input-country" placeholder="Seleziona paese ..." v-model="changeableUser.information.country" :options="countries"></select-with-image>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="input-name">
            <template #label> <b>Nome *</b> </template>
            <b-form-input id="input-name" type="text" :state="validation.firstname" v-model="changeableUser.information.firstname" @input="checkRequiredField($event, 'firstname')"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="input-lastname">
            <template #label> <b>Cognome *</b> </template>
            <b-form-input id="input-lastname" type="text" :state="validation.lastname" v-model="changeableUser.information.lastname" @input="checkRequiredField($event, 'lastname')"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="input-birth-date">
            <template #label> <b>Data di nascita</b> </template>
            <b-form-input id="input-birth-date" type="date" v-model="changeableUser.information.birth_date"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="input-gender">
            <template #label> <b>Genere</b> </template>
            <select-with-image id="input-gender" placeholder="Seleziona genere ..." v-model="changeableUser.information.sex" :options="genders"></select-with-image>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="input-occupation">
            <template #label> <b>Occupazione</b> </template>
            <b-form-input id="input-occupation" type="text" v-model="changeableUser.information.occupation"></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row >
        <b-col>
          <fieldset>
            <legend>Contatti</legend>
            <b-row cols="1" cols-md="2" >
              <b-col>
                <b-form-group label-for="input-email">
                  <template #label> <b>Email *</b> </template>
                  <b-form-input id="input-email" type="email" :state="validation.email" v-model="changeableUser.information.email" @input="checkRequiredField($event, 'email')" />
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group label-for="input-tel-num">
                  <template #label> <b>Numero di telefono</b> </template>
                  <b-form-input id="input-tel-num" type="tel" v-model="changeableUser.information.tel_number" />
                </b-form-group>
              </b-col>
            </b-row>
          </fieldset>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="d-flex justify-content-end">
          <b-button v-if="isChangedSomething" variant="primary" @click="save"> Salva </b-button>
        </b-col>
      </b-row>
    </b-container>
  </wrap-loading>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "change-user-information",
  props: {
    user: Object
  },
  data(){
    return {
      changeableUser: { information: {}, userID: '', _id: ''},
      changePassword: false,
      validation:{
        email: true,
        firstname: true,
        lastname: true,
      },
      processing: false
    }
  },
  watch: {
    user(val){
      this.setChangeableUser(val)
    }
  },
  computed: {
    ...mapGetters(['genders', 'getGenderByValue', 'countries']),
    oldProfileImage(){
      return this.user.information.img
    },
    gender: function (){
      return this.getGenderByValue(this.user.information.sex)?.text
    },
    isChangedSomething: function (){
      return !equals(this.changeableUser.information, this.user.information) &&
             Object.values(this.validation).every(v => v === true)
    },
  },
  methods: {
    setChangeableUser(vl){
      this.changeableUser = clone(vl)
    },
    checkRequiredField: function (val, field){
      // if(val.length === 0) this.changeableUser.information[field] = this.user.information[field]
      switch (field){
        case 'firstname':
          this.validation.firstname = this.changeableUser.information.firstname.length > 0
          break;
        case 'lastname':
          this.validation.lastname = this.changeableUser.information.lastname.length > 0
          break;
        case 'email':
          this.validation.email = EmailValidator.check(this.changeableUser.information.email)
          break;
      }
    },

    cancel: function (){
      this.$emit('cancel')
    },

    save: function (){
      this.processing = true
      if(!equals(this.changeableUser.information, this.user.information)) {
        let formData = new FormData();
        Object.entries(this.changeableUser.information)
              .filter(([k, v]) => this.user.information[k] !== v)
              .forEach(([k, v]) => {
                if(v instanceof File && v.size === 0) formData.append(k, '')
                else formData.append(k, v)
              })
        for(let [k, v] of formData.entries()) console.debug(k, " = ", v)

        this.$store.dispatch('users/update-information', formData)
            .then(response => {
              console.debug(response.data)
              this.$socket.emit('user:update:info', { _id: this.user._id, information: response.data.info } )
              this.$emit('save', response.data.info)
            })
            .catch(this.$store.$api.errorsHandler.users.updateUser)
            .finally(() => this.processing = false)
      }
    }
  },
  created() {
    this.setChangeableUser(this.user)
  },
}
</script>

<style scoped>

</style>
