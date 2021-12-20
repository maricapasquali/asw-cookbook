<template>
  <b-avatar :id="avatarId"
            :variant="variant"
            :src="$data._image"
            :size="size"
            @img-error="imageError"
            :badge="$data._badge" badge-variant="success"/>
</template>

<script>

import {Server} from "@services/api";
import {mapGetters} from "vuex";

export default {
  name: "avatar",
  props: {
    value: String,
    user: String,
    size: {
      type: Number,
      default: 70
    },
    variant: {
      type: String,
      default: 'dark'
    }
  },
  data: function(){
    return {
      _image: '',
      _badge: false
    }
  },
  watch: {
    value(vl){
     this.setImage(vl)
    },
    user(vl){
      console.debug('avatar: set other user => ', vl._id)
      this.onCheckUserState(vl)
    }
  },
  computed: {
    avatarId(){
      return 'avatar'+(`-${this.user}` || '')
    },
    ...mapGetters(['socket']),
  },
  methods: {
    imageError(e){
      console.error('Image ' + this.$data._image + ' is not found.')
      this.$data._image = ''
      this.$emit('onNotFound')
    },
    setImage(vl){
        this.$data._image = vl ? Server.images.path(vl) : ''
    },
    setOnline(vl){
      this.$data._badge = vl.online
      console.debug(this.user ,' is ',( vl.online ? 'online': 'offline'))
      if(vl.online) this.$emit('online', true)
      else this.$emit('offline', false)
    },

    onCheckUserState(vl){
      if(vl){
        this.socket.emit('check:user:state', vl)
        this.socket.on('user:online:' + vl, this.setOnline.bind(this))
        this.socket.on('user:offline:' + vl, this.setOnline.bind(this))
      }
    }
  },
  mounted() {
    console.debug('mounted avatar')
    this.setImage(this.value)
    this.onCheckUserState(this.user)
  },
}
</script>

<style scoped>
</style>