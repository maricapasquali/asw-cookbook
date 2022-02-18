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

import Server from "@api/server.info";
import {mapGetters} from "vuex";

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
    }
  },
  watch: {
    value(vl){
     this.setImage(vl)
    },
    user(vl){
      this._setBadge(this._onlines, vl)
    },
    _onlines(val, old){
      this._setBadge(val, this.user)
    }
  },
  computed: {
    ...mapGetters({
      _onlines: 'users/online',
      _offlines: 'users/offline'
    }),
    avatarId(){
      return 'avatar'+(`-${this.user}` || '')
    }
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

    _setBadge(usersOnline, vl){
      if( Array.isArray(vl) ){
        let isOnline = vl.some(i => usersOnline.includes(i))
        let isAllOffline = vl.every(i => !usersOnline.includes(i))
        this.$data._badge = isOnline
        vl.forEach(i =>{
          let online = usersOnline.includes(i)
          if(online) this.$emit('online', { _id: i })
          let offline = this._offlines[i]
          if(offline) this.$emit('offline', { _id: i, offline }, isAllOffline)
          console.debug(`State of \'${i}\' is ${online ? 'online': 'offline'}`)
        })
      }
      else if(vl){
        let isOnline = usersOnline.some(s => s === vl)
        this.$data._badge = isOnline
        if(isOnline) this.$emit('online', { _id: vl })
        else if(this._offlines[vl]) this.$emit('offline', { _id: vl, offline: this._offlines[vl] }, true)
        console.debug(`State of \'${vl}\' is ${isOnline ? 'online': 'offline'}`)
      }
    }
  },
  created() {
    this.$data._default = this.group ? 'people-fill': ''
    this.setImage(this.value)
    this._setBadge(this._onlines, this.user)
  }
}
</script>

<style scoped>
</style>
