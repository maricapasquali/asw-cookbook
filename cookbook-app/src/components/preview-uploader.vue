<template>
 <b-container class="file-uploader text-center" fluid>
   <b-modal v-if="imageType" centered v-model="zoom" hide-footer @hidden="closeZoomImage">
     <b-img fluid center :src="load_file_preview" />
   </b-modal>
   <b-row>
     <b-form-file :id="id" v-show="false" @change="loadFile" ref="uploader" :accept="accept" />
     <b-col v-if="videoType && load_file_preview">
       <video class="video-preview" :src="load_file_preview" controls @error="notFound"/>
     </b-col>
     <b-avatar v-else :title="title" :icon="icon" :square="!avatar" variant="dark" :src="load_file_preview" :size="load_file_preview? 200: 100"  class="mx-auto" @click.native="openZoomImage" @img-error="notFound"/>
   </b-row>
   <b-row class="mt-1">
     <b-button-group class="mx-auto">
       <b-button v-if="isCancellable" title="Annulla modifiche" @click="cancelChanges" variant="secondary"><font-awesome-icon icon="undo" /></b-button>
       <b-button @click="clickLoad" title="Carica" variant="primary"><b-icon-upload /></b-button>
       <b-button v-if="isRemovable" title="Cancella immagine" @click="removeImage" variant="danger"><b-icon-trash-fill /></b-button>
     </b-button-group>
   </b-row>
 </b-container>
</template>

<script>

export default {
  name: "preview-uploader",
  props: {
    id: {
      type: String,
      required: true
    },
    avatar: Boolean,
    fileType: {
      type: String,
      enum: ['image', 'video'],
      default: function (){
        return this.avatar ? 'image' : ''
      }
    },
    default: String,
    zoomable: {
      type: Boolean,
      default: false
    },
    removable: {
      type: Boolean,
      default: false
    }
  },

  data: function (){
    return {
      load_file_preview: '',
      zoom: false,
      remove: false
    }
  },
  computed: {

    imageType(){
      return this.avatar || this.fileType === 'image'
    },
    videoType(){
      return this.fileType === 'video'
    },

    isCancellable: function (){
      return this.load_file_preview !== this.default || this.remove
    },
    isRemovable(){
      return this.removable && this.default;
    },
    title(){
      if(this.default && this.load_file_preview == null) return this.default + " NOT FOUND."
    },
    icon(){
      if(this.avatar) return ''
      if(this.default && this.load_file_preview == null) return 'file-earmark-x-fill'
      if(this.imageType) return 'file-image'
      if(this.videoType) return 'file-earmark-play'
      return 'file'
    },
    accept(){
      if(this.imageType) return 'image/*'
      if(this.videoType) return 'video/*'
    }
  },
  methods:{
    openZoomImage: function (){
      if(!this.zoomable || !this.load_file_preview) return ;
      console.debug('Open Zoom ...')
      this.zoom = true
    },
    closeZoomImage: function (){
      if(!this.zoomable || !this.load_file_preview) return ;
      console.debug('Close Zoom ...')
      this.zoom = false
    },
    clickLoad: function (){
      this.$refs.uploader.$el.firstChild.click()
    },
    notFound(event){
      console.error(this.fileType + " (" + event?.target?.src + ") not found.. ")
      this.load_file_preview = null
    },

    // CANCEL
    cancelChanges: function (){
      this.$refs.uploader.reset()
      this.load_file_preview = this.default
      this.remove = false
      this.$emit('cancelSelectFile')
    },
    // UPLOAD
    loadFile: function (e){
      const file = e.target.files[0]
      if(this.imageType) return ReaderStreamImage.read(file, this.setFile.bind(this, file))
      if(this.videoType) return ReaderStreamVideo.read(file, this.setFile.bind(this, file))
    },
    setFile(file, result){
      console.debug('File = ' , file)
      this.$emit('selectFile', file)
      console.debug(`Load file ${file.type} preview...`)
      this.load_file_preview = result
      this.remove = false
    },

    // REMOVE
    removeImage: function (){
      if(this.isRemovable){
        this.remove = true
        this.load_file_preview = ''
        this.$emit('selectFile', new File([], ''));
      }
    },
  },
  created() {
    this.load_file_preview = this.default
  }
}
</script>

<style scoped>
.video-preview {
  object-fit: cover;
  height: auto;
  width: 100%
}
</style>
