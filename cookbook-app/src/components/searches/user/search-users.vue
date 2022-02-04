<template>
  <b-container fluid >
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
        <b-card v-for="i in skeleton" :key="i">
          <b-row>
            <b-col cols="3" align-self="center"><b-skeleton type="avatar"/> </b-col>
            <b-col align-self="center" cols="6">
              <b-row cols="1">
                <b-col><b-skeleton width="50%" /></b-col>
                <b-col><b-skeleton width="30%" /></b-col>
              </b-row>
            </b-col>
            <b-col class="text-right" align-self="center" cols="3">
              <b-row cols="1">
                <b-col class="text-right"> <b-skeleton width="100%" /> </b-col>
                <b-col class="text-right mt-3"><b-skeleton width="100%" /> </b-col>
              </b-row>
            </b-col>
          </b-row>
        </b-card>
      </template>
      <wrap-loading v-model="search.processing">
        <b-row cols="1" class="user-container">
          <b-col v-if="atLeastOneUser">
            <div class="mb-2" v-if="search.mode"><strong > Risultati: </strong></div>
            <b-card v-for="(user, index) in users" :key="user._id">
              <b-row>
                <b-col align-self="center" class="text-center px-0" cols="3"><avatar v-model="user.information.img" :user="user._id"/></b-col>
                <b-col align-self="center" cols="5">
                  <b-row cols="1">
                    <b-col>
                      <router-link :to="{name: 'single-user', params: {id: user._id}}"> {{user.userID}} </router-link>
                    </b-col>
                    <b-col v-if="user.information.occupation">{{user.information.occupation}}</b-col>
                  </b-row>
                </b-col>
                <b-col class="text-right" align-self="center" cols="4">
                  <b-row cols="1">

                    <b-col v-if="user.information.country">
                      <country-image v-model="user.information.country" :id="user._id" width="70" height="60"/>
                    </b-col>

                    <b-friendship class="col mt-3" :other-user="otherUser(index)"/>

                  </b-row>
                </b-col>
              </b-row>
            </b-card>
            <b-row class="mb-2" v-if="!search.mode && areOthers">
              <b-col class="text-center">
                <b-button variant="link" @click="others"> Altri </b-button>
              </b-col>
            </b-row>
          </b-col>
          <b-col v-else-if="search.mode && !atLeastOneUser" class="mt-4" >
            <strong class="mx-5"> Risultati: Nessun utente </strong>
          </b-col>
        </b-row>
      </wrap-loading>
    </b-skeleton-wrapper>
  </b-container>
</template>

<script>

import {bus} from '@/main'
import api, {Server} from '@api'
import {mapGetters} from "vuex";

export default {
  name: "search-users",
  data(){
    return {
      skeleton: 4,
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
        limit: 3 //TODO: CHANGE
      },

    }
  },
  computed: {
    atLeastOneUser(){
      return this.users.length > 0
    },
    areOthers(){
      return this.users.length >0 && this.users.length < this.total
    },
    ...mapGetters(['accessToken', 'userIdentifier', 'isLoggedIn', 'userFriends'])
  },
  methods: {
    // SEARCH
    searchUser(){
       if(this.search.value.length === 0) return this.resetSearch();

       this.search.mode = true
       this.search.processing = true

       this.$router.push({query: { name: this.search.value }})

       api.users
          .getUsers({ userID: { search: 'partial', value: this.search.value } }, this.accessToken)
          .then(({data}) => this.users = data.items)
          .catch(api.users.HandlerErrors.getUsersWithAndWithoutFilters)
          .finally(() => this.search.processing = false)
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

      api.users
         .getUsers(query, this.accessToken, pagination)
         .then(({data}) => {
            let _data = data.items

           if(currentPage) this.users.push(..._data)
           else this.users = _data

           this.total = data.total

           if(!limit) this.pagination.page = page
           console.debug('Page = ', JSON.stringify(this.pagination, null))
           console.debug('Total = ', this.total)

         })
         .catch(api.users.HandlerErrors.getUsersWithAndWithoutFilters)
         .finally(() => this.processing = false)
    },
    others(){
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
            user.information.img = userInfo.information.img ? Server.images.path(userInfo.information.img) : ''
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
    bus.$on('user:checked', this.fetchUsers.bind(this))

    bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    bus.$on('user:delete', this.onDeleteUser.bind(this))
  },
  beforeDestroy() {
    bus.$off('user:checked', this.fetchUsers.bind(this))

    bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    bus.$off('user:delete', this.onDeleteUser.bind(this))
  },
  mounted() {
    this.getUsers()

    window.onpopstate = function (e){
      this.getUsers()
    }.bind(this)
  }
}
</script>

<style lang="scss" scoped>
</style>