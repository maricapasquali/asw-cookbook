<template>
  <b-container>
    <b-container
      v-if="haveFriend"
      class="friend-search-container my-3 p-3"
    >
      <strong> Ricerca </strong>
      <b-row
        cols="1"
        cols-sm="2"
      >
        <b-col>
          <b-form-group
            label-for="userID-search"
            label="UserID"
          >
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text> <b-icon-search /> </b-input-group-text>
              </b-input-group-prepend>
              <b-form-input
                id="userID-search"
                v-model="filter.userID.value"
                type="search"
                placeholder="Inserisci nome utente completo o parziale"
              />
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label-for="state-search"
            label="Stato"
          >
            <b-input-group class="col-12 px-0">
              <custom-select
                id="state-search"
                v-model="filter.state"
                :options="filterOptions.state"
              >
                <template #icon-prepend>
                  <b-icon-search />
                </template>
              </custom-select>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button
            v-if="searchIsOn"
            title="Reset filtri"
            variant="secondary"
            @click="resetFilters"
          >
            <font-awesome-icon icon="undo" />
          </b-button>
        </b-col>
      </b-row>
    </b-container>

    <window-with-resize
      size="sm"
      @in-bound="stacked_=$event"
    >
      <b-table
        ref="friendTable"
        :items="_friends"
        :fields="fields"
        :filter="filter"
        :current-page="pagination.currentPage"
        :per-page="pagination.for_page"
        :busy.sync="pagination.isBusy"
        :stacked="stacked_"
        :style="cssTable"
        show-empty
        @context-changed="abortRequest"
      >
        <template #cell(user)="row">
          <b-row class="pl-4">
            <b-col class="pr-0 mt-2">
              <avatar
                v-model="row.item.user.img"
                :user="row.item.user._id"
                :size="40"
              />
            </b-col>
            <b-col
              cols="9"
              class="pl-0"
            >
              <b-row cols="1">
                <b-col> {{ row.item.user.userID }} </b-col>
                <b-col>
                  <country-image
                    :id="row.index"
                    v-model="row.item.user.country"
                  />
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </template>

        <template #cell(state)="row">
          <b-button-group
            class="pl-4"
            vertical
          >
            <b-friendship
              :other-user="row.item.user"
              with-chat
              no-follow-button
              @add-friend="fetchData"
              @remove-friend="fetchData"
            />
          </b-button-group>
        </template>

        <template #table-busy>
          <div class="text-center text-primary my-2">
            <b-spinner class="align-middle" />
            <strong class="ml-2">Caricamento...</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center text-primary my-2">
            <strong class="ml-2">Non ci sono amici </strong>
          </div>
        </template>

        <template #emptyfiltered>
          <div class="text-center text-primary my-2">
            <strong class="ml-2">Non ci sono amici {{ searchIsOn ? 'filtrati': '' }} </strong>
          </div>
        </template>
      </b-table>
    </window-with-resize>
    <b-pagination
      v-model="pagination.currentPage"
      :total-rows="pagination.totals"
      :per-page="pagination.for_page"
      align="fill"
      aria-controls="friend-table"
    />
  </b-container>
</template>

<script>

import {
    PendingRequestMixin,
    UserMixin
} from "@mixins"
import { mapGetters } from "vuex"

export default {
    name: "FriendsSection",
    mixins: [UserMixin, PendingRequestMixin],
    data() {
        return {
            stacked_: false,
            idRequest: "friend-all",

            filterOptions: {
                state: [
                    { text: "Seleziona stato della richiesta di amicizia", value: "" },
                    { text: "In attesa", value: "pending" },
                    { text: "Accettate", value: "accepted" },
                    { text: "Rifiutate", value: "rejected" }
                ]
            },
            pagination: {
                currentPage: 1,
                for_page: 5,
                totals: 0,
                isBusy: false
            },
            filter: {
                userID: { search: "partial", value: "" } ,
                state: "",
            },
            fields: [
                {
                    key: "user",
                    label: "Utente",
                },
                {
                    key: "state",
                    label: "Stato"
                }
            ]
        }
    },
    computed: {
        cssTable() {
            return {
                "--cell-align": this.stacked_ ? "start" :"end"
            }
        },

        searchIsOn() {
            return this.filter.state || this.filter.userID.value
        },

        haveFriend() {
            return this.allMyFriends.length > 0
        },

        ...mapGetters({

            userIdentifier: "session/userIdentifier",
            allMyFriends: "friendships/friends"
        }),
    },
    created() {
        this.$bus.$on("friendship:request:" + this.userIdentifier, this.fetchData.bind(this))
        this.$bus.$on("friendship:remove:" + this.userIdentifier, this.fetchData.bind(this))

        this.$bus.$on("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$on("user:delete", this.fetchData.bind(this))
    },
    beforeDestroy() {
        this.$bus.$off("friendship:request:" + this.userIdentifier, this.fetchData.bind(this))
        this.$bus.$off("friendship:remove:" + this.userIdentifier, this.fetchData.bind(this))

        this.$bus.$off("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$off("user:delete", this.fetchData.bind(this))
    },
    methods: {
        friendsId(_id) {
            return "avatar-"+_id
        },

        isAccepted(friendship) {
            return friendship.state === "accepted"
        },

        resetFilters() {
            this.filter = {
                userID: { search: "partial", value: "" } ,
                state: ""
            }
        },
        abortRequest() {
            this.pendingRequests.cancel(this.idRequest, "search friend abort.")
        },
        _friends(ctx) {
            let options = this.makeRequestOptions(this.idRequest)

            console.debug("ctx = ", ctx)
            let { perPage, currentPage } = ctx || {}
            let forPage = perPage || this.pagination.for_page
            let page = currentPage || this.pagination.currentPage
            this.pagination.isBusy = true

            let userID = ctx.filter.userID.value ? ctx.filter.userID : undefined
            let state = ctx.filter.state || undefined

            return this.$store.dispatch("friendships/own",{ userID, state, pagination: { page, limit: forPage }, options })
                .then(({ data }) => {
                    console.debug("Friends = ",data.items, ", total = ", data.total)
                    this.pagination.totals = data.total
                    return data.items
                })
                .catch(err => {
                    this.$store.$api.errorsHandler.friends.getFriendOf(err, { _forbiddenPage: true })
                    return []
                })
                .finally(() => {
                    this.pagination.isBusy = false
                    this.pendingRequests.remove(this.idRequest)
                })
        },

        /* Listeners notification */
        fetchData() {
            let table = this.$refs.friendTable
            table && table.refresh()
            console.debug("fetch table friends :", table)
        },

        /* Listeners update */
        onUpdateInfos(userInfo) {
            if (userInfo) {
                const index = this.$refs.friendTable.localItems.findIndex(f => f.user._id === userInfo._id)
                if (index !== -1) {
                    const friend = this.$refs.friendTable.localItems[index]
                    if (userInfo.information) {
                        friend.user.img = this._formatUserImage(userInfo.information.img)
                        if (userInfo.information.country) friend.user.country = userInfo.information.country
                        if (userInfo.information.occupation) friend.user.occupation = userInfo.information.occupation
                    }
                    if (userInfo.userID) friend.user.userID = userInfo.userID
                    this.$refs.friendTable.localItems.splice(index, 1, friend)
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep table tr {
  & th[aria-colindex="2"],
  td[aria-colindex="2"] {
    text-align: var(--cell-align);
  }
}

.friend-search-container {
  border: 1px solid lightgray;
  border-radius: 10px;
}
</style>
