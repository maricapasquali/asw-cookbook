<template>
  <b-container
    class="file-uploader text-center"
    fluid
  >
    <b-modal
      v-if="imageType"
      v-model="zoom"
      centered
      hide-footer
      @hidden="closeZoomImage"
    >
      <b-img
        fluid
        center
        :src="load_file_preview"
      />
    </b-modal>
    <b-row>
      <b-form-file
        v-show="false"
        :id="id"
        ref="uploader"
        :accept="accept"
        @change="loadFile"
      />
      <b-col v-if="videoType && load_file_preview">
        <video
          class="video-preview"
          :src="load_file_preview"
          controls
          @error="notFound"
        />
      </b-col>
      <b-avatar
        v-else
        :title="title"
        :icon="icon"
        :square="!avatar"
        variant="dark"
        :src="load_file_preview"
        :size="load_file_preview? 200: 100"
        class="mx-auto"
        @click.native="openZoomImage"
        @img-error="notFound"
      />
    </b-row>
    <b-row class="mt-1">
      <b-button-group class="mx-auto">
        <b-button
          v-if="isCancellable"
          title="Annulla modifiche"
          variant="secondary"
          @click="cancelChanges"
        >
          <font-awesome-icon icon="undo" />
        </b-button>
        <b-button
          title="Carica"
          variant="primary"
          @click="clickLoad"
        >
          <b-icon-upload />
        </b-button>
        <b-button
          v-if="isRemovable"
          title="Cancella immagine"
          variant="danger"
          @click="removeImage"
        >
          <b-icon-trash-fill />
        </b-button>
      </b-button-group>
    </b-row>
  </b-container>
</template>

<script>

export default {
    name: "PreviewUploader",
    props: {
        id: {
            type: String,
            required: true
        },
        avatar: Boolean,
        fileType: {
            type: String,
            enum: ["image", "video"],
            default() {
                return this.avatar ? "image" : ""
            }
        },
        default: {
            type: String,
            default: ""
        },
        zoomable: {
            type: Boolean,
            default: false
        },
        removable: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            load_file_preview: "",
            zoom: false,
            remove: false
        }
    },
    computed: {

        imageType() {
            return this.avatar || this.fileType === "image"
        },
        videoType() {
            return this.fileType === "video"
        },

        isCancellable() {
            return this.load_file_preview !== this.default || this.remove
        },
        isRemovable() {
            return this.removable && this.default
        },
        title() {
            return this.default && this.load_file_preview == null ? this.default + " NOT FOUND." : ""
        },
        icon() {
            if (this.avatar) return ""
            if (this.default && this.load_file_preview == null) return "file-earmark-x-fill"
            if (this.imageType) return "file-image"
            if (this.videoType) return "file-earmark-play"
            return "file"
        },
        accept() {
            if (this.imageType) return "image/*"
            if (this.videoType) return "video/*"
            throw new Error("No valid type")
        }
    },
    created() {
        this.load_file_preview = this.default
    },
    methods:{
        openZoomImage() {
            if (!this.zoomable || !this.load_file_preview) return
            console.debug("Open Zoom ...")
            this.zoom = true
        },
        closeZoomImage() {
            if (!this.zoomable || !this.load_file_preview) return
            console.debug("Close Zoom ...")
            this.zoom = false
        },
        clickLoad() {
            this.$refs.uploader.$el.firstChild.click()
        },
        notFound(event) {
            console.error(this.fileType + " (" + event?.target?.src + ") not found.. ")
            this.load_file_preview = null
        },

        // CANCEL
        cancelChanges() {
            this.$refs.uploader.reset()
            this.load_file_preview = this.default
            this.remove = false
            this.$emit("cancelSelectFile")
        },
        // UPLOAD
        loadFile(e) {
            const file = e.target.files[0]
            if (this.imageType) return ReaderStreamImage.read(file, this.setFile.bind(this, file))
            if (this.videoType) return ReaderStreamVideo.read(file, this.setFile.bind(this, file))
        },
        setFile(file, result) {
            console.debug("File = " , file)
            this.$emit("selectFile", file)
            console.debug(`Load file ${file.type} preview...`)
            this.load_file_preview = result
            this.remove = false
        },

        // REMOVE
        removeImage() {
            if (this.isRemovable) {
                this.remove = true
                this.load_file_preview = ""
                this.$emit("selectFile", new File([], ""))
            }
        },
    }
}
</script>

<style scoped>
.video-preview {
  object-fit: cover;
  height: auto;
  width: 100%;
}
</style>
