<template>
  <div>
    <app-navigator v-if="navigatorVisibility"/>
    <router-view :class="classObject" />
    <app-footer v-if="footerVisibility" />

    <server-error-handler v-model="serverError"/>
    <bad-request-error-handler v-model="badRequestError"/>
    <unauthenticated-error-handler v-model="unAuthenticatedError"/>
    <forbidden-error-handler v-model="forbiddenError"/>
    <not-found-error-handler v-model="notFoundResource"/>
  </div>
</template>

<script>
import {mapGetters, mapActions} from "vuex";

export default {
  name: 'App',
  data(){
    return {
      routeWithoutNavigationBar: [undefined, 'login', 'end-signup', 'reset-password', 'reset-password', 'change-password', 'chat'],
      routeWithoutFooter: [undefined, 'login', 'end-signup', 'reset-password', 'reset-password', 'change-password', 'chat'],

      serverError: {
        show: false,
        message: ''
      },
      badRequestError: {
        show: false,
        message: ''
      },
      unAuthenticatedError: {
        show: false,
        _forbiddenPage: false
      },
      forbiddenError: {
        show: false,
        message: ''
      },
      notFoundResource: {
        show: false,
        resource: {}
      }
    }
  },
  computed:{
    ...mapGetters({
      accessToken: 'session/accessToken',
      isLoggedIn: 'session/isLoggedIn',
      isAdmin: 'session/isAdmin',
      userIdentifier: 'session/userIdentifier',
      username: 'session/username'
    }),
    navigatorVisibility: function (){
      return !this.routeWithoutNavigationBar.includes(this.$route.name)
    },
    footerVisibility: function (){
      return !this.routeWithoutFooter.includes(this.$route.name)
    },
    classObject(){
      return {
        'mt-6': this.navigatorVisibility,
        'mb-8': this.navigatorVisibility
      }
    }
  },
  watch:{
    accessToken(val){
      console.warn('CHANGE ACCESS TOKEN ... ',  this.$socket)
      this.$socket.connectStart({
        key: val,
        userinfo: this.isLoggedIn ? { _id: this.userIdentifier, userID: this.username, isAdmin: this.isAdmin} : undefined
      })
    },
    username(val){
      console.warn('CHANGE USER ID ... ',  this.$socket)
      this.$socket.connectStart({
        key: this.accessToken,
        userinfo: this.isLoggedIn ? { _id: this.userIdentifier, userID: val, isAdmin: this.isAdmin} : undefined
      })
    }
  },
  methods: {
    ...mapActions(['initialization']),
    updateGUIListener(){
      this.$bus.$on('hide:navigation-bar', () => this.routeWithoutNavigationBar.push(this.$route.name))
      this.$bus.$on('hide:footer', () => this.routeWithoutFooter.push(this.$route.name))

      this.$bus.$on('show:error:bad-request', err => this.badRequestError = {show: true, ...err})
      this.$bus.$on('show:error:unauthenticated', err => this.unAuthenticatedError = {show: true, ...err})
      this.$bus.$on('show:error:forbidden', err => this.forbiddenError = {show: true, ...err})
      this.$bus.$on('show:error:not-found', err => this.notFoundResource = {show: true, ...err})
      this.$bus.$on('show:error:server-internal', err => this.serverError = {show: true, ...err})

    },
    registerFriendShipListener(){
      this.$socket.on('friendship:request', this.$bus.notification.friendShipRequest.bind(this))
      this.$socket.on('friendship:update', this.$bus.notification.friendShipUpdate.bind(this))
      this.$socket.on('friendship:remove', this.$bus.notification.friendShipRemove.bind(this))
    },
    registerFoodListener(){
      this.$socket.on('food:create', this.$bus.notification.foodCreate.bind(this))
      this.$socket.on('food:update', this.$bus.update.updateFood.bind(this))
    },
    registerCommentListener(){
      this.$socket.on('comment:response', this.$bus.notification.commentResponse.bind(this))
      this.$socket.on('comment:report', this.$bus.notification.commentReport.bind(this))
      this.$socket.on('comment:update', this.$bus.update.updateComment.bind(this))
      this.$socket.on('comment:delete', this.$bus.update.deleteComment.bind(this))
      this.$socket.on('comment:unreport', this.$bus.update.unReportComment.bind(this))
    },
    registerLikeListener(){
      this.$socket.on('like:recipe', this.$bus.notification.likeRecipe.bind(this))
      this.$socket.on('like:comment', this.$bus.notification.likeComment.bind(this))
      this.$socket.on('unlike:recipe', this.$bus.update.unlikeRecipe.bind(this))
      this.$socket.on('unlike:comment', this.$bus.update.unlikeComment.bind(this))
    },
    registerRecipeListener(){
      this.$socket.on('recipe:comment', this.$bus.notification.recipeComment.bind(this))
      this.$socket.on('recipe:create', this.$bus.notification.createSharedRecipe.bind(this))
      this.$socket.on('recipe:update', this.$bus.notification.updateSharedRecipe.bind(this))
      this.$socket.on('recipe:delete', this.$bus.notification.deleteSharedRecipe.bind(this))
    },
    registerUserInfoListener(){
      this.$socket.on('user:update:password', this.$bus.notification.afterUpdatePassword.bind(this))
      this.$socket.on('user:strike', this.$bus.notification.onAddStrike.bind(this))

      this.$socket.on('user:signup', this.$bus.update.signupUser.bind(this))
      this.$socket.on('user:checked', this.$bus.update.checkUser.bind(this))
      this.$socket.on('user:update:info', this.$bus.update.updateInfoUser.bind(this))
      this.$socket.on('user:delete', this.$bus.update.deleteUser.bind(this))
    },

    registerChatMessage(){
      this.$socket.on('push-messages', this.$bus.chat.pushMessages.bind(this))
    }
  },
  created() {
    console.log('App created ')

    this.updateGUIListener()

    this.initialization()
        .then(vl => console.log('Initialization ok : Store State ', this.$store.state))
        .catch(err => {
          console.error('Something wrong during the initialization: ', err.message)
          console.error(err.response)
        })

    this.registerFriendShipListener()
    this.registerFoodListener()
    this.registerCommentListener()
    this.registerLikeListener()
    this.registerRecipeListener()
    this.registerUserInfoListener()
    this.registerChatMessage()

    console.debug('Store ', this.$store)
    console.debug('Socket ', this.$socket)
    console.debug('Bus ', this.$bus)
  },
  beforeDestroy() {
      this.$socket.disconnect()
  }
}
</script>

<style lang="scss">
body{
  background-color: $background-color!important;
}
</style>
