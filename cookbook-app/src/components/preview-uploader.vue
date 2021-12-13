<template>
 <b-container class="file-uploader text-center" fluid>
   <b-modal v-if="imageType" centered v-model="zoom" hide-footer @hidden="closeZoomImage">
     <b-img fluid center :src="load_file_preview" />
   </b-modal>
   <b-row>
     <b-form-file :id="id" v-show="false" @change="loadFile" ref="uploader" :accept="accept" />
     <b-col v-if="videoType && load_file_preview">
       <video class="video-preview" :src="load_file_preview" controls/>
     </b-col>
     <b-avatar v-else :icon="icon" :square="!avatar" variant="dark" :src="load_file_preview" :size="load_file_preview? 200: 100"  class="mx-auto" @click.native="openZoomImage"/>
   </b-row>
   <b-row class="mt-1">
     <b-button-group class="mx-auto">
       <b-button v-if="isCancellable" :id="cancelChangesId" @click="cancelChanges" variant="secondary"><font-awesome-icon icon="undo" /></b-button>
       <b-tooltip v-if="isCancellable" :target="cancelChangesId">Annulla modifiche</b-tooltip>
       <b-button @click="clickLoad" :id="uploadImageId" variant="primary"><b-icon-upload /></b-button>
       <b-tooltip :target="uploadImageId">Carica</b-tooltip>
       <b-button v-if="isRemovable" :id="removeImageId" @click="removeImage" variant="danger"><b-icon-trash-fill /></b-button>
       <b-tooltip v-if="isRemovable" :target="removeImageId">Cancella immagine</b-tooltip>
     </b-button-group>
   </b-row>
 </b-container>
</template>

<script>

import {ReaderStreamImage, ReaderStreamVideo} from "@services/filesystem";

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
    cancelChangesId(){
      return 'cancel-changes-'+ this.id
    },
    uploadImageId(){
      return 'upload-image-'+ this.id
    },
    removeImageId(){
      return 'remove-image'+ this.id
    },


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

    icon(){
      if(this.avatar) return ''
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
      console.log('Open Zoom ...')
      this.zoom = true
    },
    closeZoomImage: function (){
      if(!this.zoomable || !this.load_file_preview) return ;
      console.log('Close Zoom ...')
      this.zoom = false
    },
    clickLoad: function (){
      this.$refs.uploader.$el.firstChild.click()
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
    setFile(file, event){
      console.log('File = ' , file)
      this.$emit('selectFile', file)
      console.log(`Load file ${file.type} preview...`)
      this.load_file_preview = event.target.result
      this.remove = false
    },

    // REMOVE
    removeImage: function (){
      if(this.isRemovable){
        this.remove = true
        this.load_file_preview = null
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