<template>
  <b-container>

    <b-container class="friend-search-container my-3 p-3" v-if="haveFriend">
      <strong> Ricerca </strong>
      <b-row cols="1" cols-sm="2">
        <b-col>
          <b-form-group label-for="userID-search" label="UserID">
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text> <b-icon-search /> </b-input-group-text>
              </b-input-group-prepend>
              <b-form-input id="userID-search" v-model="filter.userID.value" type="search" placeholder="Inserisci nome utente completo o parziale"/>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label-for="state-search" label="Stato">
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text> <b-icon-search /> </b-input-group-text>
              </b-input-group-prepend>
              <b-form-select id="state-search" v-model="filter.state" :options="filterOptions.state" />
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
       <b-col>
         <b-button id="reset-friend" variant="secondary" @click="resetFilters" v-if="searchIsOn">
           <font-awesome-icon icon="undo" />
         </b-button>
         <b-tooltip target="reset-friend" v-if="searchIsOn">Reset filtri</b-tooltip>
       </b-col>
      </b-row>
    </b-container>

    <window-with-resize size="sm" @in-bound="$data._stacked=$event">
      <b-table :items="_friends"
               @context-changed="abortRequest"
               :fields="fields"
               :filter="filter"
               :current-page="pagination.currentPage"
               :per-page="pagination.for_page"
               :busy.sync="pagination.isBusy"
               :stacked="$data._stacked"
               :style="cssTable"
               ref="friendTable"
               show-empty>

        <template #cell(user)="row">
          <b-row class="pl-4">
            <b-col class="pr-0 mt-2">
              <avatar v-model="row.item.user.img" :user="row.item.user._id" :size="40"/>
            </b-col>
            <b-col cols="9" class="pl-0">
              <b-row cols="1">
                <b-col> {{ row.item.user.userID }} </b-col>
                <b-col>
                  <country-image v-model="row.item.user.country" :id="row.index" />
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </template>

        <template #cell(state)="row" >
          <b-button-group class="pl-4" vertical>
            <b-friendship :other-user="row.item.user" with-chat @add-friend="fetchData" @remove-friend="fetchData" no-follow-button/>
          </b-button-group>
        </template>

        <template #table-busy>
          <div  class="text-center text-primary my-2">
            <b-spinner class="align-middle"></b-spinner>
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
            <strong class="ml-2">Non ci sono amici {{ searchIsOn ? 'filtrati': ''}} </strong>
          </div>
        </template>

      </b-table>
    </window-with-resize>
    <b-pagination  v-model="pagination.currentPage"
                  :total-rows="pagination.totals"
                  :per-page="pagination.for_page" align="fill" aria-controls="friend-table"  />
  </b-container>
</template>

<script>

import UserMixin from "@components/mixins/user.mixin"
import {mapGetters} from "vuex";
import {QueuePendingRequests} from "@api/request";

export default {
  name: "friends-section",
  mixins: [UserMixin],
  computed: {
    cssTable(){
      return {
        '--cell-align': this.$data._stacked ? 'start' :'end'
      }
    },

    searchIsOn(){
      return this.filter.state || this.filter.userID.value
    },

    haveFriend(){
      return this.allMyFriends.length > 0
    },

    ...mapGetters({

      userIdentifier: 'session/userIdentifier',
      allMyFriends: 'friendships/friends'
    }),
  },
  data(){
    return {
      _stacked: false,
      pendingRequests: null,
      idRequest: 'friend-all',

      filterOptions: {
        state: [
          { text: 'Seleziona stato della richiesta di amicizia', value: '' },
          { text: 'In attesa', value: 'pending' },
          { text: 'Accettate', value: 'accepted' },
          { text: 'Rifiutate', value: 'rejected' }
        ]
      },
      pagination: {
        currentPage: 1,
        for_page: 3, //TODO: CHANGE IN 10
        totals: 0,
        isBusy: false
      },
      filter: {
        userID: {search: 'partial', value: ''} ,
        state: '',
      },
      fields: [
        {
          key: 'user',
          label: 'Utente',
        },
        {
          key: 'state',
          label: 'Stato'
        }
      ]
    }
  },
  methods: {
    friendsId(_id){
      return 'avatar-'+_id
    },

    isAccepted(friendship){
      return friendship.state === 'accepted'
    },

    resetFilters(){
      this.filter = {
        userID: {search: 'partial', value: ''} ,
        state: ''
      }
    },
    abortRequest(){
      this.pendingRequests.cancel(this.idRequest, 'search friend abort.')
    },
    _friends(ctx){
      let options = QueuePendingRequests.makeOptions(this.pendingRequests, this.idRequest)

      console.debug('ctx = ', ctx);
      let {perPage, currentPage} = ctx || {}
      let forPage = perPage || this.pagination.for_page
      let page = currentPage || this.pagination.currentPage
      this.pagination.isBusy = true

      let userID = ctx.filter.userID.value ? ctx.filter.userID : undefined
      let state = ctx.filter.state || undefined

      return this.$store.dispatch('friendships/own',{ userID, state, pagination: { page, limit: forPage }, options})
                .then(({data}) => {
                  console.debug('Friends = ',data.items, ', total = ', data.total)
                  this.pagination.totals = data.total
                  return data.items
                })
                .catch(err => {
                  this.handleRequestErrors.friends.getFriendOf(err, {_forbiddenPage: true})
                  return []
                })
                .finally(() => {
                  this.pagination.isBusy = false
                  this.pendingRequests.remove(this.idRequest)
                })
    },

    /* Listeners notification */
    fetchData(){
      let table = this.$refs.friendTable
      table && table.refresh()
      console.debug('fetch table friends :', table)
    },

    /* Listeners update */
    onUpdateInfos(userInfo) {
      if(userInfo) {
        const index = this.$refs.friendTable.localItems.findIndex(f => f.user._id === userInfo._id)
        if(index !== -1){
          const friend = this.$refs.friendTable.localItems[index]
          if(userInfo.information){
            friend.user.img = this._formatUserImage(userInfo.information.img)
            if(userInfo.information.country) friend.user.country = userInfo.information.country
            if(userInfo.information.occupation) friend.user.occupation = userInfo.information.occupation
          }
          if(userInfo.userID) friend.user.userID = userInfo.userID
          this.$refs.friendTable.localItems.splice(index, 1, friend)
        }
      }
    }
  },
  created() {
    this.pendingRequests = QueuePendingRequests.create()
    this.$bus.$on('friendship:request:' + this.userIdentifier, this.fetchData.bind(this))
    this.$bus.$on('friendship:remove:' + this.userIdentifier, this.fetchData.bind(this))

    this.$bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$on('user:delete', this.fetchData.bind(this))
  },
  beforeDestroy() {
    this.pendingRequests.cancelAll('all friends cancel.')
    this.$bus.$off('friendship:request:' + this.userIdentifier, this.fetchData.bind(this))
    this.$bus.$off('friendship:remove:' + this.userIdentifier, this.fetchData.bind(this))

    this.$bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$off('user:delete', this.fetchData.bind(this))
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

.friend-search-container{
  border: 1px solid lightgray;
  border-radius: 10px;
}
</style>
