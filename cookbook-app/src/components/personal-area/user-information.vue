<template>
  <b-container>
    <b-row cols="1">
      <b-col v-if="personalArea && changeMode">
        <change-user-information
          :user="user"
          @cancel="onCloseChangeMode"
          @save="onSaveChangeMode"
        />
      </b-col>
      <b-col
        v-else
        class="user-infos p-4"
      >
        <b-skeleton-wrapper :loading="isNotLoaded">
          <template #loading>
            <b-container fluid>
              <b-row
                align-h="between"
                class="text-center"
              >
                <b-col class="d-flex justify-content-start">
                  <b-skeleton type="avatar" />
                </b-col>
              </b-row>
              <b-row
                cols="1"
                cols-sm="2"
              >
                <b-col>
                  <b-row
                    cols="1"
                    cols-md="2"
                  >
                    <b-col><b>UserID</b></b-col>
                    <b-col><b-skeleton width="30%" /></b-col>
                  </b-row>
                  <b-row
                    cols="1"
                    cols-md="2"
                  >
                    <b-col><b>Nome completo</b></b-col>
                    <b-col><b-skeleton width="50%" /></b-col>
                  </b-row>
                  <b-row
                    cols="1"
                    cols-md="2"
                  >
                    <b-col><b>Data di nascita</b></b-col>
                    <b-col><b-skeleton width="40%" /></b-col>
                  </b-row>
                  <b-row
                    cols="1"
                    cols-md="2"
                  >
                    <b-col><b>Genere</b></b-col>
                    <b-col><b-skeleton width="70%" /></b-col>
                  </b-row>
                  <b-row
                    cols="1"
                    cols-md="2"
                  >
                    <b-col><b>Occupazione</b></b-col>
                    <b-col><b-skeleton width="40%" /></b-col>
                  </b-row>
                  <b-row cols="1">
                    <b-col><b>Contatti</b></b-col>
                    <b-col>
                      <ul>
                        <li><b-col><b-skeleton width="50%" /></b-col></li>
                        <li><b-col><b-skeleton width="60%" /></b-col></li>
                      </ul>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
            </b-container>
          </template>
          <b-container fluid>
            <b-row v-if="user.isAdmin">
              <h3>Amministratore di sistema</h3>
            </b-row>
            <b-row
              align-h="between"
              class="text-center mb-3"
            >
              <b-col class="d-flex justify-content-start">
                <avatar
                  v-model="user.information.img"
                  variant="light"
                  :user="user._id"
                />
              </b-col>
              <b-col
                align-self="center"
                class="d-flex justify-content-end"
              >
                <country-image
                  id="owner"
                  v-model="user.information.country"
                  width="100"
                  height="70"
                />
              </b-col>
            </b-row>
            <b-row
              cols="1"
              cols-sm="2"
            >
              <b-col>
                <b-row
                  cols="1"
                  cols-md="2"
                >
                  <b-col><b>UserID</b></b-col>
                  <b-col><p>{{ user.userID }}</p></b-col>
                </b-row>
                <b-row
                  cols="1"
                  cols-md="2"
                >
                  <b-col><b>Nome completo</b></b-col>
                  <b-col><p>{{ user.information.firstname }} {{ user.information.lastname }}</p></b-col>
                </b-row>
                <b-row
                  v-if="user.information.birth_date"
                  cols="1"
                  cols-md="2"
                >
                  <b-col><b>Data di nascita</b></b-col>
                  <b-col><p>{{ user.information.birth_date | localDate(user.information.country) }}</p></b-col>
                </b-row>
                <b-row
                  v-if="user.information.gender"
                  cols="1"
                  cols-md="2"
                >
                  <b-col><b>Genere</b></b-col>
                  <b-col><p>{{ gender }}</p></b-col>
                </b-row>
                <b-row
                  v-if="user.information.occupation"
                  cols="1"
                  cols-md="2"
                >
                  <b-col><b>Occupazione</b></b-col>
                  <b-col><p>{{ user.information.occupation }}</p></b-col>
                </b-row>
                <b-row
                  v-if="user.information.email || user.information.tel_number"
                  cols="1"
                >
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
              <b-col
                v-if="personalArea"
                align-self="end"
                class="d-flex justify-content-end px-0"
              >
                <b-button-group vertical>
                  <b-button
                    v-if="!changeMode"
                    variant="secondary"
                    @click="changeMode = true"
                  >
                    Modifica
                  </b-button>
                  <b-button
                    v-if="user.isSigned && !user.isAdmin"
                    variant="secondary"
                    @click="changeUserID=true"
                  >
                    Cambia userID
                  </b-button>
                  <b-button
                    variant="secondary"
                    @click="changePassword=true"
                  >
                    Cambia password
                  </b-button>
                  <b-button
                    v-if="user.isSigned && !user.isAdmin"
                    variant="secondary"
                    @click="deleteAccount=true"
                  >
                    Cancella Account
                  </b-button>
                </b-button-group>
                <!-- DELETE ACCOUNT -->
                <delete-account
                  :id="user._id"
                  v-model="deleteAccount"
                  @onDeleteAccount="onDeleteAccount"
                />
                <!-- CHANGE PASSWORD -->
                <change-password
                  :id="user._id"
                  v-model="changePassword"
                />
                <!-- CHANGE USERID-->
                <change-userid
                  :id="user._id"
                  v-model="changeUserID"
                  :old-user-id="user.userID"
                  @onChangeUserID="onChangeUserID"
                />
              </b-col>
              <b-col
                v-else-if="isLoggedIn && isOtherUser"
                align-self="end"
                class="d-flex justify-content-end px-0"
              >
                <b-button-group vertical>
                  <b-button
                    v-if="user.isAdmin || isAdmin"
                    :title="'Chat con '+user.userID"
                    variant="secondary"
                    @click="_goToChat(user._id)"
                  >
                    <b-icon-chat-fill />
                  </b-button>
                  <b-friendship
                    v-else
                    :other-user="user"
                    with-chat
                  />
                </b-button-group>
              </b-col>
            </b-row>
          </b-container>
        </b-skeleton-wrapper>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

import {
    mapGetters,
    mapMutations
} from "vuex"
import {
    ChatMixin,
    PendingRequestMixin
} from "@mixins"

export default {
    name: "UserInformation",
    filters: {
        localDate(text, country) {
            let date = new Date(text)
            switch (country) {
                case "US":
                    return date.toLocaleDateString("en-US")
                default:
                    return date.toLocaleDateString()
            }
        }
    },
    mixins:[ChatMixin, PendingRequestMixin],
    props:{
        id: {
            type: String,
            required: true
        },
        personalArea: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            user: { information: {}, userID: "", _id: "" },
            changeMode: false,
            deleteAccount: false,
            changeUserID: false,
            changePassword: false
        }
    },
    computed:{
        ...mapGetters(["getGenderByValue"]),
        ...mapGetters({
            userIdentifier: "session/userIdentifier",
            isAdmin: "session/isAdmin",
            isSigned: "session/isSigned",
            isLoggedIn: "session/isLoggedIn"
        }),

        isNotLoaded() {
            return this.user._id.length === 0
        },
        gender() {
            return this.getGenderByValue(this.user.information.gender)?.text
        },
        isOtherUser() {
            return this.userIdentifier !== this.id
        }
    },
    created() {
        console.debug(`CREATE GUI INFO USER (${this.id})...`)
        this.getUser()

        this.$bus.$on("user:update:info", this.onUpdateInfos.bind(this))
    },
    beforeDestroy() {
        this.$bus.$off("user:update:info", this.onUpdateInfos.bind(this))
    },
    methods:{
        ...mapMutations({
            changeUserId: "session/change-username",
        }),
        getUser(_id) {
            let idReq = "user-info"
            let options = this.makeRequestOptions(idReq)
            this.$store.dispatch("users/information-of", { userID: _id || this.id, options })
                .then(({ data }) => {
                    this.user = data
                    console.debug(this.user)
                    this.$emit("is-user-admin", this.user.isAdmin)
                })
                .catch(err => this.$store.$api.errorsHandler.users.getUser(err, { _forbiddenPage: this.personalArea }))
                .then(notFound => {
                    if (notFound) this.$emit("not-found")
                    this.pendingRequests.remove(idReq)
                })
        },

        onChangeUserID(val) {
            this.user.userID = val
            this.changeUserId(val)
        },

        onDeleteAccount() {
            this.$store.dispatch("reset")
            this.$router.replace({ name: "homepage" })
        },

        onSaveChangeMode(val) {
            this.user.information = val
            this.onCloseChangeMode()
        },
        onCloseChangeMode() {
            this.changeMode = false
        },

        /* Listeners update */
        onUpdateInfos(userInfo) {
            if (userInfo && this.id === userInfo._id) {
                if (userInfo.information) this.user.information = userInfo.information
                if (userInfo.userID) this.user.userID = userInfo.userID
            }
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .accept-request {
  background-color: #f8f9fa;
  border-color: #f8f9fa;
  color: $component-color;
}

.user-infos {
  border: 1px dashed black;
  border-radius: 10px;
  background: $component-color;
  color: white;
}
</style>
