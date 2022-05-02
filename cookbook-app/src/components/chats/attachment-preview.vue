<template>
  <b-skeleton-wrapper :loading="processing">
    <template #loading>
      <b-row>
        <b-col>
          <b-card no-body img-left>
            <b-skeleton-img card-img="left" width="150px"></b-skeleton-img>
            <b-card-body class="preview-description">
              <b-skeleton animation="wave" width="85%"></b-skeleton>
              <br/>
              <b-skeleton animation="wave" width="85%"></b-skeleton>
              <b-skeleton animation="wave" width="55%"></b-skeleton>
              <b-skeleton animation="wave" width="70%"></b-skeleton>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
    </template>

    <b-card no-body img-left>
      <b-container fluid class="px-0">
        <b-row v-if="removable" class="mt-2 mr-1">
          <b-col class="text-right">
            <font-awesome-icon class="icon" icon="times" @click="remove" />
          </b-col>
        </b-row>
        <b-link :href="item.link" target="_blank">
          <b-row no-gutters>
            <b-col v-show="item.img" ref="image-attachment" md="6">
              <b-card-img class="rounded-0 h-100" :src="item.img" img-alt="Attachment image" @error="onImageError"/>
            </b-col>
            <b-col :md="item.img ? 6: 12">
              <b-card-body :title="item.title" class="preview-description">
                <b-card-text text-tag="div" v-if="item.description"> {{item.description | length(250) }} </b-card-text>
                <div v-else>
                  <span v-if="item.link">{{item.link}}</span>
                  <div v-else>
                    <b-skeleton class="not-found-description" animation="null" width="85%"></b-skeleton>
                    <b-skeleton class="not-found-description" animation="null" width="55%"></b-skeleton>
                    <b-skeleton class="not-found-description" animation="null" width="70%"></b-skeleton>
                  </div>
                </div>
              </b-card-body>
            </b-col>
          </b-row>
        </b-link>
      </b-container>
    </b-card>
  </b-skeleton-wrapper>
</template>

<script>
export default {
  name: "attachment-preview",
  props: {
    attachmentApi: { type: Function },
    attachment: {type: String },

    value: {
      img: String,
      title: {type: String, required: true},
      description: {type: String, required: true},
      link: String
    },
    removable: Boolean
  },
  data(){
    return {
      processing: true,

      itemNotFound: {
        img: require('@assets/images/404-page.png'),
        title: 'Not Found',
        description: null,
        link: null
      },
      item: {}
    }
  },
  watch: {
    attachment(val){
      this.getMeta(val)
    },
    value(val){
      if(val) this.setItem(val)
    }
  },
  filters: {
    length(text, len){
      return text.length > len ? text.substring(0, len) + ' ...': text
    }
  },
  methods: {
    onImageError(e){
      console.error('Image '+ this.item.img+' not found.')
      e.target.parentNode.remove()
      this.item.img = ''
    },
    setItem(val){
      if(typeof val === 'object' && ['title', 'description'].every(i => Object.keys(val).includes(i))) this.item = val
      else this.setItemNotFound(val)
      console.debug('Items attachment = ', this.item)
    },

    setItemNotFound(e){
      console.error('Not found ... : ', e)
      this.item = e ? Object.assign(this.itemNotFound, {link: e.link}) : this.itemNotFound
    },

    getMeta(val){
      this.attachmentApi(val).then((_attachment) => this.setItem(_attachment),
                                   (e) => { console.error('reject = reason : '+ e); this.setItemNotFound(e); })
                              .catch((e) => {
                                console.error('catch = reason : ',e);
                                this.setItemNotFound(e)
                              })
                              .finally(() => {
                                console.debug('End processing .....');
                                this.processing = false
                              })
    },

    remove(){
      if(this.removable) this.$emit('removeAttachment')
    }
  },
  created() {
    console.debug('this.value ', this.value, ', this.attachmentApi ', typeof this.attachmentApi, ', this.attachment ' , this.attachment)
    if(this.value) {
      this.setItem(this.value)
      this.processing = false
    }
    else if(this.attachment && this.attachmentApi) this.getMeta(this.attachment)
    else new Error('Required props : attachment && attachmentApi or only value (v-model)')
  }
}
</script>

<style lang="scss" scoped>
.not-found-description{
  cursor: auto;
}

.preview-description{
  & p {
    height: 0;
    min-height: 110px;
    overflow: hidden;
  }
}
</style>