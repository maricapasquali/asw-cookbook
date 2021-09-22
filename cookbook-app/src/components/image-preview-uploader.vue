<template>
 <b-container class="file-uploader text-center" fluid>
   <b-modal centered v-model="zoom" hide-footer @hidden="closeZoomImage">
     <b-img fluid center :src="profile_img"></b-img>
   </b-modal>
   <b-row>
     <b-form-file
         :id="id" v-show="false"
         @change="loadImage"
         ref="uploader"
         accept="image/*"
     ></b-form-file>
     <b-img
         id="img-profile"
         :thumbnail="isSetImage"
         width="200"
         height="200"
         rounded="circle"
         fluid
         center
         :src="profile_img"
         @click="openZoomImage"
         @error="imgError"
         alt="Imagine profilo"></b-img>
   </b-row>
   <b-row>
    <b-container fluid class="text-center">
      <b-button v-if="isSetImage" @click="cancelImage" variant="secondary">Annulla</b-button>
      <b-button @click="clickLoad" variant="primary">Carica</b-button>
      <b-button v-if="removable" @click="removeImg" variant="primary">Rimuovi</b-button>
    </b-container>
   </b-row>
 </b-container>
</template>

<script>

export default {
  name: "image-preview-uploader",
  props: {
    id: String,
    value: File,
    zoomable: {
      type: Boolean,
      default: false
    },
    default: {
      default: require('@assets/icons/person-circle.svg'),
    },
    removable: {
      type: Boolean,
      default: false
    }
  },

  data: function (){
    return {
      p_default: require('@assets/icons/person-circle.svg'),
      profile_img: '',
      zoom: false,
      remove: false,
    }
  },
  computed: {
    isSetImage: function (){
      return !this.isDefaultImage()
    }
  },
  created() {
    this.readFile(this.value)
  },
  methods:{
    isImageFile: function (file){
      return /image\/.*/.test(file.type)
    },
    isDefaultImage: function (){
      return this.default === this.profile_img
    },
    imgError: function (){
      this.profile_img = this.default
    },
    openZoomImage: function (){
      if(!this.zoomable || this.isDefaultImage()) return ;
      console.log('Open Zoom ...')
      this.zoom = true
    },
    closeZoomImage: function (){
      if(!this.zoomable || this.isDefaultImage()) return ;
      console.log('Close Zoom ...')
      this.zoom = false
    },
    clickLoad: function (){
      this.$refs.uploader.$el.firstChild.click()
    },
    cancelImage: function (){
      if(this.isDefaultImage()) return ;
      this.$refs.uploader.reset()
      this.profile_img = this.default
      this.$emit('selectImage', new File([], "", undefined))
    },
    loadImage: function (e){
     this.readFile(e.target.files[0], true)
    },
    readFile: function(files, emit = false){
      if (files && this.isImageFile(files)) {
        if(emit) this.$emit('selectImage', files)
        const fileReader = new FileReader();
        fileReader.readAsDataURL(files);
        fileReader.addEventListener("load", this.fileReaderLoad);
      }
    },

    fileReaderLoad: function (e){
      console.log('Load image preview...')
      this.profile_img = e.target.result
    },
    removeImg: function (){
      //TODO: REMOVABLE IMAGE
    }
  }
}
</script>

<style scoped>
</style>