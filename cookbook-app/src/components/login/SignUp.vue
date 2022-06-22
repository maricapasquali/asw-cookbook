<template>
  <div id="signup-card">
    <b-alert
      v-model="error.show"
      variant="danger"
    >
      {{ error.msg }}
    </b-alert>
    <b-alert
      v-model="success"
      variant="success"
      class="text-center"
      centered
    >
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
              label="Immagine Profilo"
              label-sr-only
            >
              <preview-uploader
                id="input-0"
                avatar
                zoomable
                @selectFile="user.img=$event"
                @cancelSelectFile="user.img=null"
              />
            </b-form-group>
            <b-row
              cols-md="2"
              cols-sm="1"
              cols="1"
            >
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
                  :state="validation.firstName"
                  required
                  @input="validation.firstName = $event.length>0"
                />
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
                  :state="validation.lastName"
                  required
                  @input="validation.lastName = $event.length>0"
                />
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
                  :state="validation.email"
                  required
                  @input="checkEmail"
                />
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
                />
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
                />
              </b-form-group>
              <b-form-group
                id="input-group-6"
                label="Genere"
                label-for="input-6"
              >
                <custom-select
                  id="input-6"
                  v-model="user.gender"
                  placeholder="Select gender"
                  :options="genders"
                />
              </b-form-group>

              <b-form-group
                id="input-group-7"
                label="Stato"
                label-for="input-7"
                class="pr-md-2"
              >
                <custom-select
                  id="input-7"
                  v-model="user.country"
                  placeholder="Select country"
                  :options="countries"
                />
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
                />
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
            >
              <b-form-input
                id="input-9"
                v-model.trim="user.userID"
                type="text"
                placeholder="Enter userID"
                :state="validation.userID"
                required
                @input="validation.userID=$event.length>0"
              />
            </b-form-group>

            <form-inputs-password
              @inputPassword="user.hash_password=$event"
              @checkPassword="validation.check_password=$event"
            />
          </b-card-body>
        </b-card>
      </b-card-body>
      <b-card-footer
        v-if="!success"
        class="primary-footer"
      >
        <p>* = campi obbligatori</p>
        <b-container fluid>
          <b-row :class="{'d-flex': true, 'justify-content-between': showCredentials, 'justify-content-end': showInformation}">
            <b-button
              v-if="showCredentials"
              variant="secondary"
              @click="back"
            >
              Indietro
            </b-button>
            <b-button
              v-if="validationInformation && showInformation"
              variant="primary"
              @click="forward"
            >
              Avanti
            </b-button>
            <b-button
              v-if="validationInformation && validationCredentials && showCredentials"
              variant="primary"
              @click="onSubmit"
            >
              Registrati
            </b-button>
          </b-row>
        </b-container>
      </b-card-footer>
    </wrap-loading>
  </div>
</template>

<script>
import {
    mapActions,
    mapGetters
} from "vuex"

export default {
    name: "SignUp",
    data() {
        return {
            user:{
                img: new File([], "", undefined),
                firstname: "",
                lastname: "",
                email: "",
                tel_number: "",
                birth_date: "",
                gender: null,
                country: null,
                occupation: "",
                userID: "",
                hash_password: "",
            },
            processing: false,
            error: {
                show: false,
                msg: ""
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
        ...mapGetters(["genders", "countries"]),
        validationInformation() {
            return this.validation.firstName && this.validation.lastName && this.validation.email
        },
        validationCredentials() {
            return this.validation.userID && this.user.hash_password.length>0 && this.validation.check_password
        }
    },
    watch: {
        processing(val) {
            if (val) this.error = { show: false, msg:"" }
        }
    },
    methods: {
        ...mapActions({
            registerUser : "users/signup"
        }),
        forward() {
            this.showCredentials = true
            this.showInformation = false
        },
        back() {
            this.showCredentials = false
            this.showInformation = true
        },

        checkEmail(email) {
            this.validation.email = EmailValidator.check(email)
        },

        signup() {
            console.debug("signup")
            const formData = new FormData()
            Object.entries(this.user)
                .filter(([,v]) => (v && v.length > 0) || (v instanceof File && v.size >0))
                .forEach(([k, v]) => formData.append(k, v))
            //for(const [k, v] of formData.entries()) console.debug(k, ' -> ', v);

            this.processing = true
            this.registerUser(formData)
                .then(({ data }) => {
                    this.success = true
                    this.showCredentials = false
                    this.$socket.emit("user:signup", data.userID)
                })
                .catch(err => {
                    this.error.show = true
                    this.error.msg = this.$store.$api.errorsHandler.users.signUp(err)
                })
                .then(() => this.processing = false)
        },

        onSubmit(event) {
            event.preventDefault()
            this.signup()
        }
    }

}
</script>

<style lang="scss" scoped>
#signup-card {
  .primary-footer {
    background-color: white;
    margin-top: 1.25rem;
  }

  .primary-body {
    padding: 0;
  }
}

</style>
