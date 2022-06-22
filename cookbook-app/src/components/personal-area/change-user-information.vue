<template>
  <wrap-loading v-model="processing">
    <b-container>
      <b-row>
        <b-col class="text-right">
          <b-button
            title="Chiudi"
            variant="danger"
            @click="cancel"
          >
            <font-awesome-icon icon="times" />
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group
            label-for="input-image-profile"
            label="Immagine Profilo"
            label-sr-only
          >
            <preview-uploader
              id="input-image-profile"
              avatar
              :default="oldProfileImage"
              zoomable
              removable
              @selectFile="changeableUser.information.img = $event"
              @cancelSelectFile="changeableUser.information.img = oldProfileImage"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row
        cols="1"
        cols-md="2"
        cols-lg="3"
      >
        <b-col>
          <b-form-group label-for="input-country">
            <template #label>
              <b>Paese</b>
            </template>
            <custom-select
              id="input-country"
              v-model="changeableUser.information.country"
              placeholder="Seleziona paese ..."
              :options="countries"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="input-name">
            <template #label>
              <b>Nome *</b>
            </template>
            <b-form-input
              id="input-name"
              v-model="changeableUser.information.firstname"
              type="text"
              :state="validation.firstname"
              @input="checkRequiredField($event, 'firstname')"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="input-lastname">
            <template #label>
              <b>Cognome *</b>
            </template>
            <b-form-input
              id="input-lastname"
              v-model="changeableUser.information.lastname"
              type="text"
              :state="validation.lastname"
              @input="checkRequiredField($event, 'lastname')"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="input-birth-date">
            <template #label>
              <b>Data di nascita</b>
            </template>
            <b-form-input
              id="input-birth-date"
              v-model="changeableUser.information.birth_date"
              type="date"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="input-gender">
            <template #label>
              <b>Genere</b>
            </template>
            <custom-select
              id="input-gender"
              v-model="changeableUser.information.gender"
              placeholder="Seleziona genere ..."
              :options="genders"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="input-occupation">
            <template #label>
              <b>Occupazione</b>
            </template>
            <b-form-input
              id="input-occupation"
              v-model="changeableUser.information.occupation"
              type="text"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <fieldset>
            <legend>Contatti</legend>
            <b-row
              cols="1"
              cols-md="2"
            >
              <b-col>
                <b-form-group label-for="input-email">
                  <template #label>
                    <b>Email *</b>
                  </template>
                  <b-form-input
                    id="input-email"
                    v-model="changeableUser.information.email"
                    type="email"
                    :state="validation.email"
                    @input="checkRequiredField($event, 'email')"
                  />
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group label-for="input-tel-num">
                  <template #label>
                    <b>Numero di telefono</b>
                  </template>
                  <b-form-input
                    id="input-tel-num"
                    v-model="changeableUser.information.tel_number"
                    type="tel"
                  />
                </b-form-group>
              </b-col>
            </b-row>
          </fieldset>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="d-flex justify-content-end">
          <b-button
            v-if="isChangedSomething"
            variant="primary"
            @click="save"
          >
            Salva
          </b-button>
        </b-col>
      </b-row>
    </b-container>
  </wrap-loading>
</template>

<script>
import { mapGetters } from "vuex"

export default {
    name: "ChangeUserInformation",
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            changeableUser: { information: {}, userID: "", _id: "" },
            changePassword: false,
            validation:{
                email: true,
                firstname: true,
                lastname: true,
            },
            processing: false
        }
    },
    computed: {
        ...mapGetters(["genders", "getGenderByValue", "countries"]),
        oldProfileImage() {
            return this.user.information.img
        },
        gender() {
            return this.getGenderByValue(this.user.information.gender)?.text
        },
        isChangedSomething() {
            return !equals(this.changeableUser.information, this.user.information) &&
             Object.values(this.validation).every(v => v === true)
        },
    },
    watch: {
        user(val) {
            this.setChangeableUser(val)
        }
    },
    created() {
        this.setChangeableUser(this.user)
    },
    methods: {
        setChangeableUser(vl) {
            this.changeableUser = clone(vl)
        },
        checkRequiredField(val, field) {
            // if(val.length === 0) this.changeableUser.information[field] = this.user.information[field]
            switch (field) {
                case "firstname":
                    this.validation.firstname = this.changeableUser.information.firstname.length > 0
                    break
                case "lastname":
                    this.validation.lastname = this.changeableUser.information.lastname.length > 0
                    break
                case "email":
                    this.validation.email = EmailValidator.check(this.changeableUser.information.email)
                    break
            }
        },

        cancel() {
            this.$emit("cancel")
        },

        save() {
            this.processing = true
            if (!equals(this.changeableUser.information, this.user.information)) {
                let formData = new FormData()
                Object.entries(this.changeableUser.information)
                    .filter(([k, v]) => this.user.information[k] !== v)
                    .forEach(([k, v]) => {
                        if (v instanceof File && v.size === 0) formData.append(k, "")
                        else formData.append(k, v)
                    })
                for (let [k, v] of formData.entries()) console.debug(k, " = ", v)

                this.$store.dispatch("users/update-information", formData)
                    .then(response => {
                        console.debug(response.data)
                        this.$socket.emit("user:update:info", { _id: this.user._id, information: response.data.info } )
                        this.$emit("save", response.data.info)
                    })
                    .catch(this.$store.$api.errorsHandler.users.updateUser)
                    .finally(() => this.processing = false)
            }
        }
    },
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
