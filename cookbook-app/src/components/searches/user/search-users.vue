<template>
  <b-container fluid >
    <b-modal v-model="stopFollow.show" title="Cancella amico" ok-only @ok="sendRemoveFriendShip" centered>
      Sei sicura/o di voler smette di seguire <strong><em>{{stopFollow.userID}}</em></strong>?
    </b-modal>
    <b-row>
      <b-col>
        <b-form-group label-for="search-user-input">
          <template #label> <strong>Ricerca</strong> </template>
          <b-input-group >
            <b-input-group-prepend> <font-awesome-icon icon="users" size="2x" class="mt-1 mr-2" /> </b-input-group-prepend>
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
            <b-col align="end" align-self="center" cols="3">
              <b-row cols="1">
                <b-col align="end"> <b-skeleton width="100%" /> </b-col>
                <b-col align="end" class="mt-3"><b-skeleton width="100%" /> </b-col>
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
                <b-col align-self="start" cols="3"><avatar v-model="user.information.img" /></b-col>
                <b-col align-self="center" cols="5">
                  <b-row cols="1">
                    <b-col>
                      <router-link :to="{name: 'single-user', params: {id: user._id}}"> {{user.userID}} </router-link>
                    </b-col>
                    <b-col v-if="user.information.occupation">{{user.information.occupation}}</b-col>
                  </b-row>
                </b-col>
                <b-col align="end" align-self="center" cols="4">
                  <b-row cols="1">

                    <b-col v-if="user.information.country">
                      <country-image v-model="user.information.country" :id="countryId(index)" width="70" height="60"/>
                    </b-col>

                    <b-col v-if="userLogged" class="friends-buttons mt-3">
                      <b-button variant="danger" v-if="justFollow(index)" @click="toggleStopFollow(index)">Smetti di seguire</b-button>
                      <span class="request-send" v-else-if="requestJustSend(index)">Richiesta inviata</span>
                      <span class="request-reject" v-else-if="requestRejected(index)"> Richiesta rifiutata </span>
                      <b-button variant="success" v-else @click="sendRequestFriendShip(index)">Segui</b-button>
                    </b-col>

                  </b-row>
                </b-col>
              </b-row>
            </b-card>
            <b-row class="mb-2" v-if="!search.mode && areOthers">
              <b-col align="center">
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
import api from '@api'
import {Session} from '@services/session'

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
      // stop follow
      stopFollow: {
        show: false,
        index: -1,
        userID: ''
      },

    }
  },
  computed: {
    atLeastOneUser(){
      return this.users.length > 0
    },
    userLogged(){
      let user = Session.userInfo()
      return user && user.isSigned && !user.isAdmin
    },
    areOthers(){
      return this.users.length >0 && this.users.length < this.total
    }
  },
  methods: {
    countryId(index){
      return 'country-'+index
    },
    amIinFriends(index, state){
      let me = this.users[index].friends.find(f => f.user === this.userLogged._id)
      return me ? me.state === state : false
    },
    justFollow(index){
      return this.amIinFriends(index, 'accepted')
    },
    requestJustSend(index){
      return this.amIinFriends(index, 'pending')
    },
    requestRejected(index){
      return this.amIinFriends(index, 'rejected')
    },
    searchUser(){
       if(this.search.value.length === 0) return this.resetSearch();

       this.search.mode = true
       this.search.processing = true

       this.$router.push({query: { name: this.search.value }})

       api.users
          .getUsers({ userID: { search: 'partial', value: this.search.value } }, Session.accessToken())
          .then(({data}) => this.users = data.items)
          .catch(err => console.error(err))
          .finally(() => this.search.processing = false)
    },
    resetSearch(val = ''){
      if( this.search.mode && val.length === 0 ) {
        console.error('close search mode')
        this.search.mode = false
        this.users = []
        this.processing = true
        this.$router.push({query: {}})
        this.getUsers(1, this.pagination.page * this.pagination.limit)
      }
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

      api.users
         .getUsers(query, Session.accessToken(), pagination)
         .then(({data}) => {
            let _data = data.items

           if(currentPage) this.users.push(..._data)
           else this.users = _data

           // this.users[0].friends.push({user: this.userLogged._id, timestamp: Date.now(), state: 'accepted'})  //TODO: REMOVE
           // this.users[1].friends.push({user: this.userLogged._id, timestamp: Date.now(), state: 'pending'})  //TODO: REMOVE
           // this.users[2].friends.push({user: this.userLogged._id, timestamp: Date.now(), state: 'rejected'})  //TODO: REMOVE

           this.total = data.total

           if(!limit) this.pagination.page = page
           console.debug('Page = ', JSON.stringify(this.pagination, null))
           console.debug('Total = ', this.total)

         })
         .catch(err => console.error(err))
         .finally(() => this.processing = false)
    },
    others(){
      this.getUsers(this.pagination.page + 1)
    },

    sendRequestFriendShip(index){
      //todo: request add friend POST /users/:id/friends
      this.users[index]
          .friends
          .push({ user: this.userLogged._id, state: 'pending', timestamp: Date.now() })
    },
    toggleStopFollow(index, show = true){
      this.stopFollow = {
        show: show,
        index: index,
        userID: index >= 0 && index < this.users.length ? this.users[index].userID: ''
      }
    },
    sendRemoveFriendShip(){
      //todo: request add friend DELETE /users/:id/friends/:user_id
      let friends = this.users[this.stopFollow.index].friends
      let _index = friends.findIndex(i => i.user === this.userLogged._id)
      if(_index !== -1) friends.splice(_index, 1)
    }
  },
  mounted() {
    this.getUsers()

    window.onpopstate = this.getUsers.bind(this)
  }
}
</script>

<style lang="scss" scoped>

.user-container {
  //overflow-y: auto;
  //height: 700px;

  & .friends-buttons{
    & > .request-send {
      color: #80bdff;
    }
    & > .request-reject {
      color: red;
    }
  }
}

</style>