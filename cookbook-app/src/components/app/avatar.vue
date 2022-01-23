<template>
  <b-avatar :id="avatarId"
            :variant="variant"
            :src="$data._image"
            :icon="$data._default"
            :size="size"
            @img-error="imageError"
            :badge="$data._badge" badge-variant="success" />
</template>

<script>

import {Server} from "@services/api";
import {mapGetters} from "vuex";
import {pushIfAbsent, removeIfPresent} from "@services/utils";

export default {
  name: "avatar",
  props: {
    value: String,
    user: String | Array,
    size: {
      type: Number,
      default: 70
    },
    variant: {
      type: String,
      default: 'dark'
    },
    group: Boolean
  },
  data: function(){
    return {
      _default: '',
      _image: '',
      _badge: false,
      _onlines: []
    }
  },
  watch: {
    value(vl){
     this.setImage(vl)
    },
    user(vl){
      if(vl) this.onCheckUserState(vl)
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
      console.debug(`State of \'${vl._id}\' is ${vl.online ? 'online': 'offline'}`)
      if(vl.online) {
        pushIfAbsent(this.$data._onlines, vl._id)
        if(this.$data._onlines.length > 0) this.$emit('online', vl)
      }
      else if(vl.offline) {
        removeIfPresent(this.$data._onlines, vl._id)
        this.$emit('offline', vl, this.$data._onlines.length === 0)
      }
      console.debug('Onlines = ', JSON.stringify(this.$data._onlines))
      this.$data._badge = this.$data._onlines.length > 0
    },

    onCheckUserState(vl){
      if(Array.isArray(vl)) vl.forEach(u => this.onCheckUserState(u))
      else if(vl){
        this.socket.emit('check:user:state', vl)
        this.socket.on('user:online:' + vl, this.setOnline.bind(this))
        this.socket.on('user:offline:' + vl, this.setOnline.bind(this))
      } else this.setOnline(false)
    }
  },
  mounted() {
    this.$data._default = this.group ? 'people-fill': ''
    this.setImage(this.value)
    if(this.user) this.onCheckUserState(this.user)
  },
}
</script>

<style scoped>
</style>