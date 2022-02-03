<template>
  <b-container v-resize="onResize">

    <b-container class="friend-search-container my-3 p-3">
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

    <b-table :items="_friends"
             :fields="fields"
             :filter="filter"
             :current-page="pagination.currentPage"
             :per-page="pagination.for_page"
             :busy.sync="pagination.isBusy"
             :stacked="isMobile"
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
          <strong class="ml-2">Non ci sono amici...</strong>
        </div>
      </template>

      <template #emptyfiltered>
        <div class="text-center text-primary my-2">
          <strong class="ml-2">Non ci sono amici filtrati ...</strong>
        </div>
      </template>

    </b-table>
    <b-pagination  v-model="pagination.currentPage"
                  :total-rows="pagination.totals"
                  :per-page="pagination.for_page" align="fill" aria-controls="friend-table"  />
  </b-container>
</template>

<script>
import {bus} from '@/main'
import api, {Server} from '@api'
import {mapGetters} from "vuex";
import {mapping} from "@services/api/users/friends/utils";

export default {
  name: "friends-section",
  computed: {
    cssTable(){
      return {
        '--cell-align': this.isMobile ? 'start' :'end'
      }
    },

    searchIsOn(){
      return this.filter.state || this.filter.userID.value
    },

    ...mapGetters(['userIdentifier', 'accessToken']),
  },
  data(){
    return {
      isMobile: false,
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

    onResize({screenWidth}){
      this.isMobile = screenWidth <= 576
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

    _friends(ctx){
      console.debug('ctx = ', ctx);
      let {perPage, currentPage} = ctx || {}
      let forPage = perPage || this.pagination.for_page
      let page = currentPage || this.pagination.currentPage
      this.pagination.isBusy = true

      let userID = ctx.filter.userID.value ? ctx.filter.userID : undefined
      let state = ctx.filter.state || undefined

      return api.friends
                .getFriendOf(this.userIdentifier, this.accessToken, { userID: userID, state: state }, { page: page, limit: forPage })
                .then(({data}) => {
                  console.debug('Friends = ',data.items, ', total = ', data.total)
                  let items = data.items.map(f => mapping(f, this.userIdentifier))
                  console.debug('Friends = ',items)
                  this.pagination.totals = data.total
                  return items
                })
                .catch(err => {
                  api.friends.HandlerError.getFriendOf(err, {_forbiddenPage: true})
                  return []
                })
                .finally(() => this.pagination.isBusy = false)
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
            friend.user.img = userInfo.information.img ? Server.images.path(userInfo.information.img) : ''
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
    bus.$on('friendship:request:' + this.userIdentifier, this.fetchData.bind(this))
    bus.$on('friendship:remove:' + this.userIdentifier, this.fetchData.bind(this))

    bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    bus.$on('user:delete', this.fetchData.bind(this))
  },
  beforeDestroy() {
    bus.$off('friendship:request:' + this.userIdentifier, this.fetchData.bind(this))
    bus.$off('friendship:remove:' + this.userIdentifier, this.fetchData.bind(this))

    bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    bus.$off('user:delete', this.fetchData.bind(this))
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