<template>
  <b-container fluid>
    <b-row>
      <b-col>
        <b-form-group label-for="search-user-input">
          <template #label> <strong>Ricerca</strong> </template>
          <b-input-group >
            <template #prepend>
              <b-input-group-text> <font-awesome-icon icon="users" /> </b-input-group-text>
            </template>
            <b-form-input id="search-user-input" type="search" placeholder="Inserisci nome utente completo o parziale"
                          v-model="search.value" @update="resetSearch" @keypress.enter="searchUser"
                          :disabled="processing"/>
            <b-input-group-append> <b-button v-show="search.value" variant="primary" @click="searchUser">Cerca</b-button> </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-skeleton-wrapper :loading="processing">
      <template #loading>
        <b-container fluid class="px-0">
          <b-row cols="1" cols-sm="1" cols-md="2" cols-lg="3" cols-xl="4">
            <b-col v-for="i in skeleton" :key="i">
              <b-card >
                <b-container>
                  <b-row>
                    <b-col cols="3" align-self="center"><b-skeleton type="avatar"/> </b-col>
                    <b-col align-self="center" cols="6">
                      <b-row cols="1">
                        <b-col><b-skeleton width="50%" /></b-col>
                        <b-col><b-skeleton width="30%" /></b-col>
                      </b-row>
                    </b-col>
                  </b-row>
                  <b-row cols="1" align-h="end">
                    <b-col cols="4" class="text-right">
                      <b-skeleton width="100%" />
                      <b-skeleton width="100%" />
                    </b-col>
                  </b-row>
                </b-container>
              </b-card>
            </b-col>
          </b-row>
        </b-container>
      </template>
      <wrap-loading v-model="search.processing">
        <b-container fluid class="px-0">
          <b-row v-if="search.mode">
            <b-col ><strong > Risultati: </strong></b-col>
          </b-row>

          <b-row cols="1" cols-sm="1" cols-md="2" cols-lg="3" cols-xl="4">

            <b-col v-for="(user, index) in users" :key="user._id" >
              <b-card no-body class="container-find-user">
                <b-container class="p-4">
                  <b-row cols="1" cols-sm="2" class="body-find-user h-100">
                    <b-col cols="12" sm="4" class="mb-2">
                      <avatar v-model="user.information.img" :user="user._id"/>
                    </b-col>
                    <b-col cols="12" sm="8" class="px-0">
                      <b-container fluid>
                        <b-row cols="1">
                          <b-col>
                            <router-link :to="{name: 'single-user', params: {id: user._id}}"> <strong><em>{{user.userID}}</em></strong> </router-link>
                          </b-col>
                          <b-col v-if="user.information.occupation">
                            <span>{{user.information.occupation}}</span>
                          </b-col>
                        </b-row>
                      </b-container>
                    </b-col>
                  </b-row>
                  <b-row cols="1" class="text-right footer-find-user" >
                    <country-image class="col" v-if="user.information.country" v-model="user.information.country"  :id="user._id" width="70" height="60"/>
                    <b-friendship class="col" :other-user="otherUser(index)"/>
                  </b-row>
                </b-container>
              </b-card>
            </b-col>
            <b-col v-if="search.mode && !atLeastOneUser" class="mt-4" >
              <strong> Nessun utente </strong>
            </b-col>
          </b-row>

          <b-row v-if="!search.mode" class="mt-2">
            <load-others :trigger-others="others" :are-others="areOthers" :in-processing="processingOthers">
              <template #btn-content>Altri ...</template>
            </load-others>
          </b-row>
        </b-container>
      </wrap-loading>
    </b-skeleton-wrapper>
  </b-container>
</template>

<script>

import UserMixin from "@components/mixins/user.mixin"
import {QueuePendingRequests} from "@api/request";

export default {
  name: "search-users",
  mixins: [UserMixin],
  data(){
    return {
      skeleton: 6,
      pendingRequests: null,

      processing: true,
      search: {
        mode: false,
        processing: false,
        value: ''
      },
      users: [],

      total: 0,
      pagination: {
        page: 1,
        limit: 4 //TODO: CHANGE
      },
      processingOthers: false

    }
  },
  computed: {
    atLeastOneUser(){
      return this.users.length > 0
    },
    areOthers(){
      return this.users.length >0 && this.users.length < this.total
    },
  },
  methods: {
    // SEARCH
    searchUser(){
       if(this.search.value.length === 0) return this.resetSearch();

       this.search.mode = true
       this.search.processing = true

       this.$router.push({query: { name: this.search.value }})

       let _id = 'search-users'
       let options = this._optionsUsers(_id, 'search users abort.')

       this.$store.dispatch('users/search-for-username', { search: 'partial', username: this.search.value, options })
          .then(({data}) => this.users = data.items)
          .catch(this.handleRequestErrors.users.getUsersWithAndWithoutFilters)
          .finally(() => {
            this.search.processing = false
            this.pendingRequests.remove(_id)
          })
    },
    resetSearch(val = ''){
      if( this.search.mode && val.length === 0 ) {
        console.error('close search mode')
        this.search.mode = false
        this.processing = true
        this.$router.push({query: {}})
        this.getUsers(0, this.pagination.page * this.pagination.limit)
      }
    },
    // USERS
    _optionsUsers(_id, message){
      return QueuePendingRequests.makeOptions(this.pendingRequests, _id, {message})
    },

    getUsers(currentPage, limit){
      const page = currentPage || 1
      const _limit = limit || this.pagination.limit

      let query = {}
      let pagination = {page: page, limit: _limit}

      if(this.$route.query && this.$route.query.name) {
        this.search.value = this.$route.query.name
        query = {userID: { search: 'partial', value: this.$route.query.name }}
        pagination = {}
        this.search.mode = true
        console.log('Serch mode = ', query.userID)
      }else {
        this.search.mode = false
        this.search.value = ''
      }

      let _id = 'users'
      let options = this._optionsUsers(_id, 'get users abort.')
      this.$store.dispatch('users/search', { query, pagination, options })
         .then(({data}) => {
            let _data = data.items

           if(currentPage) this.users.push(..._data)
           else this.users = _data

           this.total = data.total

           if(!limit) this.pagination.page = page
           console.debug('Page = ', JSON.stringify(this.pagination, null))
           console.debug('Total = ', this.total)

         })
         .catch(this.handleRequestErrors.users.getUsersWithAndWithoutFilters)
         .finally(() => {
           this.processing = false
           this.processingOthers = false
           this.pendingRequests.remove(_id)
         })
    },
    others(){
      this.processingOthers = true
      this.getUsers(this.pagination.page + 1)
    },
    //FRIENDSHIP
    otherUser(index){
      return this.users[index]
    },

    /* Listeners user */
    fetchUsers(){
      if(!this.search.mode) this.getUsers(0, this.pagination.page * this.pagination.limit)
    },
    /* Listeners update */
    onUpdateInfos(userInfo) {

      if(!this.search.mode && userInfo) {
        const index = this.users.findIndex(user => user._id === userInfo._id)
        if(index !== -1){
          const user = this.users[index]
          if(userInfo.userID) user.userID = userInfo.userID
          if(userInfo.information) {
            user.information.img = this._formatUserImage(userInfo.information.img)
            if(userInfo.information.occupation) user.information.occupation = userInfo.information.occupation
            if(userInfo.information.country) user.information.country = userInfo.information.country
          }
          this.users.splice(index, 1, user)
        }
      }

    },
    onDeleteUser(id){
      if(!this.search.mode) {
        const index = this.users.findIndex(user => user._id === id)
        if(index !== -1) this.users.splice(index, 1)
      }
    }
  },
  created() {
    this.pendingRequests = QueuePendingRequests.create()
    this.$bus.$on('user:checked', this.fetchUsers.bind(this))

    this.$bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$on('user:delete', this.onDeleteUser.bind(this))

    this.getUsers()

    window.onpopstate = function (e){ this.getUsers() }.bind(this)
  },
  beforeDestroy() {
    this.pendingRequests.cancelAll('Search users cancel operation.')

    this.$bus.$off('user:checked', this.fetchUsers.bind(this))
    this.$bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$off('user:delete', this.onDeleteUser.bind(this))
  }
}
</script>

<style lang="scss" scoped>
.container-find-user{
  position: relative;
  min-height: 170px;
  .footer-find-user {
    position: absolute;
    bottom: 11px;
    right: 20px;
  }
}
@media only screen and (max-width: 768px) {
  .container-find-user {
    min-height: 0!important;
  }
}
@media only screen and (max-width: 400px){
  .container-find-user{
    & .footer-find-user {
      position: unset!important;
    }
    & .body-find-user {
      height: unset!important;
    }
  }
}
</style>
