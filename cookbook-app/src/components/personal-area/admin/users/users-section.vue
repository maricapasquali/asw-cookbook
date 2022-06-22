<template>
  <b-container>
    <b-row class="mt-5">
      <b-col>
        <b-form-group label-for="input-search-userID">
          <b-input-group>
            <template #prepend>
              <b-input-group-text><b-icon-search /></b-input-group-text>
            </template>
            <b-form-input
              id="input-search-userID"
              v-model="filters.userID.value"
              type="search"
              placeholder="Inserisci username completo o parziale"
            />
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <!-- Table user  -->
    <b-row
      cols="1"
      class="mt-3 mb-5 mx-auto"
    >
      <window-with-resize
        size="sm"
        @in-bound="stacked_=$event"
      >
        <b-table
          id="user-table"
          ref="userTable"
          responsive
          hover
          :stacked="stacked_"
          :tbody-tr-class="rowClass"
          :busy.sync="pagination.isBusy"
          :filter="filters"
          :fields="fieldsUsersTable"
          :items="getUser"
          :current-page="pagination.currentPage"
          :per-page="pagination.for_page"
          show-empty
          @context-changed="abortRequest"
          @row-clicked="item => $set(item, '_showDetails', !item._showDetails)"
        >
          <template #table-busy>
            <div class="text-center text-primary my-2">
              <b-spinner class="align-middle" />
              <strong class="ml-2">Caricamento...</strong>
            </div>
          </template>

          <template #empty>
            <div class="text-center text-primary my-2">
              <strong class="ml-2">Non ci sono utenti iscritti </strong>
            </div>
          </template>

          <template #emptyfiltered>
            <div class="text-center text-primary my-2">
              <strong class="ml-2">Nessun utente </strong>
            </div>
          </template>

          <template #cell(state)="row">
            <div class="user-state ">
              <p
                v-if="isChecked(row.value)"
                class="user-checked"
              >
                Verificato
              </p>
              <p
                v-else-if="isPending(row.value)"
                class="user-pending"
              >
                In Attesa
              </p>
              <p
                v-else
                class="user-unknown"
              >
                Stato sconosciuto
              </p>
            </div>
          </template>

          <template #cell(strike)="row">
            <b-icon-x-square-fill
              v-for="i in row.value"
              :key="i"
              class="strikes-user mr-1"
              font-scale="2pt"
              variant="danger"
            />
          </template>

          <template #cell(actions)="row">
            <b-button-group>
              <b-button
                v-if="row.item.actions.includes('chat')"
                variant="primary"
                title="Chat"
                @click="_goToChat(row.item.details._id)"
              >
                <b-icon-chat-fill />
              </b-button>

              <b-button
                v-if="row.item.actions.includes('delete')"
                variant="danger"
                title="Cancella utente"
                @click="openDeleteModal(row.item.details)"
              >
                <b-icon-trash-fill />
              </b-button>
            </b-button-group>
          </template>

          <template #row-details="row">
            <ul style="list-style: none;">
              <li v-if="row.item.details.information.email">
                <strong>Email:</strong> <em>{{ row.item.details.information.email }}</em>
              </li>
              <li v-if="row.item.details.information.tel_number">
                <strong>Numero di telefono:</strong> <em>{{ row.item.details.information.tel_number }}</em>
              </li>
            </ul>
          </template>
        </b-table>
      </window-with-resize>
      <b-pagination
        v-show="showPagination"
        v-model="pagination.currentPage"
        :total-rows="pagination.totals"
        :per-page="pagination.for_page"
        align="fill"
        aria-controls="user-table"
      />
    </b-row>
    <!-- DELETE ACCOUNT -->
    <delete-account
      :id="deleteAccount.user._id"
      v-model="deleteAccount.show"
      @onDeleteAccount="afterDeleteAccount"
    >
      <template #message>
        <p> Sei sicuro di voler eliminare l'account di <strong><i>{{ deleteAccount.user.userID }}</i></strong>? </p>
      </template>
    </delete-account>
  </b-container>
</template>

<script>

import { mapGetters } from "vuex"
import {
    ChatMixin,
    PendingRequestMixin
} from "@mixins"

export default {
    name: "UsersSection",
    mixins: [ChatMixin, PendingRequestMixin],
    data() {
        return {
            stacked_: false,
            idRequest: "users-all",

            pagination: {
                isBusy: false,
                currentPage: 1,
                totals: 0,
                for_page: 5,
                show: false
            },

            filters: {
                userID: {
                    search: "partial",
                    value: ""
                },
                fullname: {
                    search: "partial",
                    value: ""
                }
            },

            fieldsUsersTable: [
                {
                    key: "userID",
                    label: "Username",
                    class: "text-center"
                },
                {
                    key: "state",
                    label: "Stato",
                    class: "text-center"
                },
                {
                    key: "createdAt",
                    label: "Data di iscrizione",
                    class: "text-center"
                },
                {
                    key: "strike",
                    label: "Strike",
                    class: "text-center"
                },
                {
                    key: "actions",
                    label: "Azioni",
                    class: "text-center"
                }
            ],

            deleteAccount: {
                show: false,
                user: {}
            }
        }
    },
    computed: {

        ...mapGetters({
            accessToken: "session/accessToken",
            userIdentifier: "session/userIdentifier"
        }),

        showPagination() {
            return this.pagination.totals > 0
        }
    },
    created() {
        this.$bus.$on("user:signup", this.fetchUsers.bind(this))
        this.$bus.$on("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$on("user:delete", this.fetchUsers.bind(this))
    },
    beforeDestroy() {
        this.$bus.$off("user:signup", this.fetchUsers.bind(this))
        this.$bus.$off("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$off("user:delete", this.fetchUsers.bind(this))
    },
    methods: {

        rowClass(item, type) {
            if (!item || type !== "row") return ""
            if (item._showDetails) return "table-primary"
        },

        isChecked(state) {
            return state === "checked"
        },

        isPending(state) {
            return state === "pending"
        },

        isDeletable(user) {
            return (
                this.isChecked(user.signup) && user.strike >= 3 ||
          this.isPending(user.signup) && user.createdAt + (86400000) < Date.now()
            )
        },

        remapping(user) {
            let actions = []
            if (this.isChecked(user.signup)) actions.push("chat")
            if (this.isDeletable(user)) actions.push("delete")
            return {
                userID: user.userID,
                state: user.signup ,
                strike: user.strike,
                createdAt: dateFormat(user.createdAt),
                actions: actions,
                details: user
            }
        },

        abortRequest() {
            this.pendingRequests.cancel(this.idRequest, "search user abort.")
        },
        getUser(ctx) {
            let options = this.makeRequestOptions(this.idRequest)

            this.pagination.isBusy = true
            let { currentPage, perPage } = ctx
            console.debug("FILTERS " , ctx.filter)
            let paginationOption = {
                page: currentPage || this.pagination.currentPage,
                limit: perPage || this.pagination.for_page
            }

            let filter = null
            if (ctx.filter.userID.value) filter = { userID: ctx.filter.userID }
            if (ctx.filter.fullname.value) filter = { fullname: ctx.filter.fullname }

            return this.$store.dispatch("users/all", { filters: filter || {}, pagination: paginationOption, options })
                .then(({ data }) => {
                    console.debug(data)
                    this.pagination.totals = data.total
                    return data.items.map(u => this.remapping(u))
                })
                .catch(err => {
                    this.$store.$api.errorsHandler.users.getUsersWithAndWithoutFilters(err, { _forbiddenPage: true })
                    return []
                })
                .finally(() => {
                    this.pagination.isBusy = false
                    this.pendingRequests.remove(this.idRequest)
                })
        },

        /* --- DELETE ACCOUNT OF USER --- */
        openDeleteModal(user) {
            this.deleteAccount = { show: true, user: user }
        },
        afterDeleteAccount() {
            console.debug("Delete account of " + this.deleteAccount.user.userID)
            this.$refs.userTable.refresh()
        },

        /* Listeners update */
        fetchUsers(user) {
            console.debug("user : ", user)
            if (user) {
                if (isString(user) || this.isPending(user.signup)) {
                    let table = this.$refs.userTable
                    table && table.refresh()
                } else if (this.isChecked(user.signup)) {
                    const _user = this.$refs.userTable.localItems.find(f => f.details._id === user._id)
                    const index = this.$refs.userTable.localItems.indexOf(_user)
                    console.debug("checked user : ", _user, ", index ", index)
                    if (index !== -1) {
                        this.$refs.userTable.localItems.splice(index, 1, this.remapping(user))
                        this.$set(this.$refs.userTable.localItems[index], "_showDetails", _user._showDetails)
                    }
                }
            }
        },

        onUpdateInfos(userInfo) {
            if (userInfo) {
                const index = this.$refs.userTable.localItems.findIndex(u => u.details._id === userInfo._id)
                if (index !== -1) {
                    const user = this.$refs.userTable.localItems[index]
                    if (userInfo.userID) {
                        user.userID = userInfo.userID
                        user.details.userID = userInfo.userID
                    }
                    if (userInfo.information) user.details.information = Object.assign(user.details.information, userInfo.information)
                    this.$refs.userTable.localItems.splice(index, 1, user)
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep #user-table > tbody > tr:not(.b-table-details) {
  cursor: pointer;
}

.table {
  & .strikes-user {
    cursor: text;
  }

  & .user-state {
    font-weight: bold;

    @each $user, $color in (checked: #28a745, pending: #ffc107, unknown: #dc3545) {
      @debug $user, $color;
      .user-#{$user} {
        color: $color;
      }
    }
  }
}
</style>
